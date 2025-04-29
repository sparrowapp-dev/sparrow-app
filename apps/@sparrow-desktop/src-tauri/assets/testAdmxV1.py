import xml.etree.ElementTree as ET
import re
import os
from datetime import datetime

def parse_wxs_file(wxs_file_path):
    """Parse the WXS file and extract registry policy information."""
    namespaces = {'wix': 'http://schemas.microsoft.com/wix/2006/wi'}
    tree = ET.parse(wxs_file_path)
    root = tree.getroot()
    
    # Extract app name from the file or registry keys
    app_name = None
    registry_keys = []
    
    # Find all registry keys under HKLM\SOFTWARE\Policies
    for reg_key in root.findall('.//wix:RegistryKey', namespaces):
        root_attr = reg_key.get('Root')
        key_attr = reg_key.get('Key', '')
        
        if root_attr == 'HKLM' and 'SOFTWARE\\Policies\\' in key_attr:
            # Extract app name if not already set
            if app_name is None:
                app_name = key_attr.split('\\')[-1]
            
            # Process registry values
            for reg_value in reg_key.findall('.//wix:RegistryValue', namespaces):
                reg_data = {
                    'key_path': key_attr,
                    'name': reg_value.get('Name', '(Default)'),
                    'type': reg_value.get('Type', 'string'),
                    'value': reg_value.get('Value', ''),
                }
                registry_keys.append(reg_data)
    
    return app_name, registry_keys

def generate_admx(app_name, registry_keys, output_dir):
    """Generate ADMX file from registry keys."""
    namespace = app_name.lower()
    filename = f"{namespace}.admx"
    
    # Create the ADMX root
    admx_root = ET.Element('policyDefinitions', {
        'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xmlns': 'http://schemas.microsoft.com/GroupPolicy/2006/07/PolicyDefinitions',
        'revision': '1.0',
        'schemaVersion': '1.0'
    })
    
    # Add policyNamespaces
    policy_namespaces = ET.SubElement(admx_root, 'policyNamespaces')
    target_ns = ET.SubElement(policy_namespaces, 'target', {
        'prefix': namespace,
        'namespace': f"{app_name}Policies"
    })
    ET.SubElement(policy_namespaces, 'using', {
        'prefix': 'windows',
        'namespace': 'Microsoft.Policies.Windows'
    })
    
    # Add resources section
    resources = ET.SubElement(admx_root, 'resources', {
        'minRequiredRevision': '1.0'
    })
    ET.SubElement(resources, 'stringTable')
    
    # Add supportedOn section
    supportedOn = ET.SubElement(admx_root, 'supportedOn')
    supportedOnDef = ET.SubElement(supportedOn, 'definitions')
    ET.SubElement(supportedOnDef, 'definition', {
        'name': f"{namespace}:Supported",
        'displayName': f"$(string.{namespace}:Supported)"
    })
    
    # Add policies section
    policies = ET.SubElement(admx_root, 'policies')
    
    # Process each registry key to create policy elements
    policy_counter = 1
    for reg in registry_keys:
        policy_name = reg['name'].replace(' ', '')
        if not policy_name or policy_name == '(Default)':
            policy_name = f"Policy{policy_counter}"
            policy_counter += 1
            
        policy = ET.SubElement(policies, 'policy', {
            'name': policy_name,
            'class': 'Machine',
            'displayName': f"$(string.{policy_name})",
            'explainText': f"$(string.{policy_name}_Help)",
            'key': reg['key_path'],
            'valueName': reg['name']
        })
        
        # Add supportedOn reference
        ET.SubElement(policy, 'supportedOn', {
            'ref': f"{namespace}:Supported"
        })
        
        # Add appropriate elements based on registry value type
        if reg['type'].lower() in ['integer', 'dword']:
            parent = ET.SubElement(policy, 'elements')
            ET.SubElement(parent, 'decimal', {
                'id': policy_name + 'Value',
                'key': reg['key_path'],
                'valueName': reg['name']
            })
        elif reg['type'].lower() == 'string':
            parent = ET.SubElement(policy, 'elements')
            ET.SubElement(parent, 'text', {
                'id': policy_name + 'Value',
                'key': reg['key_path'],
                'valueName': reg['name']
            })
        elif reg['type'].lower() == 'expandsz':
            parent = ET.SubElement(policy, 'elements')
            ET.SubElement(parent, 'text', {
                'id': policy_name + 'Value',
                'key': reg['key_path'],
                'valueName': reg['name'],
                'expandable': 'true'
            })
        elif reg['type'].lower() == 'boolean' or reg['type'].lower() == 'flag':
            ET.SubElement(policy, 'enabledValue', {}).text = '1'
            ET.SubElement(policy, 'disabledValue', {}).text = '0'
    
    # Write to file
    tree = ET.ElementTree(admx_root)
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, filename)
    
    with open(output_path, 'wb') as f:
        f.write(b'<?xml version="1.0" encoding="utf-8"?>\n')
        tree.write(f, encoding='utf-8')
    
    return filename, namespace

def generate_adml(app_name, registry_keys, namespace, output_dir):
    """Generate ADML file from registry keys."""
    filename = f"{namespace}.adml"
    
    # Create the ADML root
    adml_root = ET.Element('policyDefinitionResources', {
        'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xmlns': 'http://schemas.microsoft.com/GroupPolicy/2006/07/PolicyDefinitions',
        'revision': '1.0',
        'schemaVersion': '1.0'
    })
    
    # Add displayName element
    display_name = ET.SubElement(adml_root, 'displayName')
    display_name.text = f"{app_name} Policy Definitions"
    
    # Add description element
    description = ET.SubElement(adml_root, 'description')
    description.text = f"Policy definitions for {app_name} applications"
    
    # Add resources
    resources = ET.SubElement(adml_root, 'resources')
    
    # Add stringTable
    string_table = ET.SubElement(resources, 'stringTable')
    
    # Add app supported string
    ET.SubElement(string_table, 'string', {
        'id': f"{namespace}:Supported"
    }).text = f"At least {app_name} 1.0"
    
    # Add string for each policy
    policy_counter = 1
    for reg in registry_keys:
        policy_name = reg['name'].replace(' ', '')
        if not policy_name or policy_name == '(Default)':
            policy_name = f"Policy{policy_counter}"
            policy_counter += 1
            
        # Create display name
        display_text = ' '.join(re.findall('[A-Z][^A-Z]*', reg['name'].replace(' ', '')) or 
            [reg['name'] if reg['name'] != '(Default)' else f"Default Policy {policy_counter}"])
        
        ET.SubElement(string_table, 'string', {'id': policy_name}).text = display_text
        ET.SubElement(string_table, 'string', {
            'id': f"{policy_name}_Help"
        }).text = f"Configure {display_text}. Default value: {reg['value']}"
    
    # Add presentationTable
    presentation_table = ET.SubElement(resources, 'presentationTable')
    
    # Add presentation for each policy
    policy_counter = 1
    for reg in registry_keys:
        policy_name = reg['name'].replace(' ', '')
        if not policy_name or policy_name == '(Default)':
            policy_name = f"Policy{policy_counter}"
            policy_counter += 1
            
        presentation = ET.SubElement(presentation_table, 'presentation', {'id': policy_name})
        
        if reg['type'].lower() in ['integer', 'dword']:
            ET.SubElement(presentation, 'decimalTextBox', {'refId': policy_name + 'Value'}).text = reg['name']
        elif reg['type'].lower() in ['string', 'expandsz']:
            ET.SubElement(presentation, 'textBox', {'refId': policy_name + 'Value'}).text = reg['name']
        # For boolean/flag types, the presentation can be empty as it's just enabled/disabled
    
    # Write to file
    tree = ET.ElementTree(adml_root)
    
    # Create en-US subfolder for ADML file
    lang_dir = os.path.join(output_dir, 'en-US')
    os.makedirs(lang_dir, exist_ok=True)
    output_path = os.path.join(lang_dir, filename)
    
    with open(output_path, 'wb') as f:
        f.write(b'<?xml version="1.0" encoding="utf-8"?>\n')
        tree.write(f, encoding='utf-8')
    
    return filename

def main():
    # Get input file path from user
    wxs_file_path = input("Enter path to WXS file: ")
    output_dir = input("Enter output directory (default: ./policy_definitions): ") or "./policy_definitions"
    
    # Parse WXS file
    app_name, registry_keys = parse_wxs_file(wxs_file_path)
    
    if not app_name:
        app_name = input("App name could not be determined. Please enter the app name: ")
    
    if not registry_keys:
        print("No policy registry keys found in HKLM\\SOFTWARE\\Policies.")
        return
    
    # Generate ADMX file
    admx_file, namespace = generate_admx(app_name, registry_keys, output_dir)
    
    # Generate ADML file
    adml_file = generate_adml(app_name, registry_keys, namespace, output_dir)
    
    print(f"Generated {admx_file} and en-US/{adml_file} in {output_dir}")
    print(f"Found {len(registry_keys)} policy settings.")

if __name__ == "__main__":
    main()