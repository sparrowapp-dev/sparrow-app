#this file is used to automate the creation of ADMX & EN-US ADML template files used to create template for group policy
#Admins use these files to control features via UI

import xml.etree.ElementTree as ET
import uuid
import os
from datetime import datetime

def extract_registry_entries(wxs_file):
    """Extract registry entries from the WXS file"""
    namespaces = {'wix': 'http://schemas.microsoft.com/wix/2006/wi'}
    tree = ET.parse(wxs_file)
    root = tree.getroot()
    
    registry_entries = []
    
    # Find all RegistryKey elements
    for reg_key in root.findall('.//wix:RegistryKey', namespaces):
        entry = {
            'root': reg_key.get('Root'),
            'key': reg_key.get('Key'),
            'values': []
        }
        
        # Get all RegistryValue elements for this key
        for reg_value in reg_key.findall('./wix:RegistryValue', namespaces):
            value_entry = {
                'type': reg_value.get('Type'),
                'name': reg_value.get('Name', ''),  # Default value if Name is not specified
                'value': reg_value.get('Value', '')
            }
            entry['values'].append(value_entry)
        
        registry_entries.append(entry)
    
    return registry_entries

def generate_policy_name(key_path, value_name):
    """Generate a policy name from registry key path and value name"""
    # Extract app name from the key path
    app_name = key_path.split('\\')[0] if '\\' in key_path else key_path
    
    # Clean and format the value name
    if value_name:
        # Remove spaces and special characters
        clean_value = ''.join(c for c in value_name if c.isalnum())
        return f"{app_name}_{clean_value}"
    else:
        # For default values
        path_parts = key_path.split('\\')
        if len(path_parts) > 1:
            return f"{app_name}_Default{''.join(path_parts[1:])}"
        else:
            return f"{app_name}_Default"

def create_admx_file(app_name, registry_entries, output_file):
    """Create the ADMX file from registry entries"""
    root = ET.Element('policyDefinitions', {
        'revision': '1.0',
        'schemaVersion': '1.0'
    })
    
    # Add policy namespaces
    policy_namespaces = ET.SubElement(root, 'policyNamespaces')
    target = ET.SubElement(policy_namespaces, 'target', {
        'prefix': app_name.lower(),
        'namespace': f"Company.Policies.{app_name}"
    })
    
    # Add resources section
    resources = ET.SubElement(root, 'resources', {'minRequiredRevision': '1.0'})
    
    # Add supportedOn section
    supported_on = ET.SubElement(root, 'supportedOn')
    definitions = ET.SubElement(supported_on, 'definitions')
    ET.SubElement(definitions, 'definition', {
        'name': f"SUPPORTED_{app_name.upper()}",
        'displayName': f"$(string.SUPPORTED_{app_name.upper()})"
    })
    
    # Add categories
    categories = ET.SubElement(root, 'categories')
    main_category = ET.SubElement(categories, 'category', {
        'displayName': f"$(string.{app_name.lower()})",
        'name': app_name.lower()
    })
    
    # Add policies section
    policies = ET.SubElement(root, 'policies')
    
    # Create a policy for each registry value
    for entry in registry_entries:
        root_key = entry['root']  # HKLM, HKCU, etc.
        key_path = entry['key']
        
        for value in entry['values']:
            value_name = value['name']
            value_type = value['type'].lower()
            
            # Generate a unique policy name
            policy_name = generate_policy_name(key_path, value_name)
            
            # Create policy element with presentation attribute
            policy = ET.SubElement(policies, 'policy', {
                'name': policy_name,
                'class': 'Both',
                'displayName': f"$(string.{policy_name})",
                'explainText': f"$(string.{policy_name}_Explain)",
                'key': f"SOFTWARE\\Policies\\{app_name}",
                'presentation': f"$(presentation.{policy_name})"  # Added presentation attribute
            })
            
            # Add parent category reference
            parent_category = ET.SubElement(policy, 'parentCategory')
            parent_category.set('ref', app_name.lower())
            
            # Add supported on reference
            supported_on_ref = ET.SubElement(policy, 'supportedOn')
            supported_on_ref.set('ref', f"SUPPORTED_{app_name.upper()}")
            
            # Handle different value types
            if value_type == 'integer' or value_type == 'dword':
                # For boolean-like integer values (0/1)
                if value['value'] == '0' or value['value'] == '1':
                    enabled = ET.SubElement(policy, 'enabledValue')
                    decimal = ET.SubElement(enabled, 'decimal')
                    decimal.set('value', '1')
                    
                    disabled = ET.SubElement(policy, 'disabledValue')
                    decimal = ET.SubElement(disabled, 'decimal')
                    decimal.set('value', '0')
                    
                    policy.set('valueName', value_name)
                else:
                    # For other integer values
                    elements = ET.SubElement(policy, 'elements')
                    decimal_element = ET.SubElement(elements, 'decimal', {
                        'id': policy_name,
                        'valueName': value_name,
                        'required': 'true'
                    })
            elif value_type == 'string':
                elements = ET.SubElement(policy, 'elements')
                text_element = ET.SubElement(elements, 'text', {
                    'id': policy_name,
                    'valueName': value_name,
                    'required': 'true'
                })
    
    # Create XML tree and write to file
    tree = ET.ElementTree(root)
    ET.indent(tree, space="  ")
    tree.write(output_file, encoding="utf-8", xml_declaration=True)

def create_adml_file(app_name, registry_entries, output_file):
    """Create the ADML file with string resources"""
    root = ET.Element('policyDefinitionResources', {
        'revision': '1.0',
        'schemaVersion': '1.0'
    })

    #add displayName
    ET.SubElement(root, 'displayName')

    #add description
    ET.SubElement(root, 'description')
    
    # Add resources element
    resources = ET.SubElement(root, 'resources')
    
    # Add stringTable
    string_table = ET.SubElement(resources, 'stringTable')
    
    # Add app name string
    ET.SubElement(string_table, 'string', {
        'id': app_name.lower()
    }).text = app_name
    
    # Add supported string
    ET.SubElement(string_table, 'string', {
        'id': f"SUPPORTED_{app_name.upper()}"
    }).text = f"At least {app_name} version 1.0"
    
    # Add strings for each policy
    for entry in registry_entries:
        key_path = entry['key']
        
        for value in entry['values']:
            value_name = value['name']
            value_type = value['type'].lower()
            
            # Generate policy name
            policy_name = generate_policy_name(key_path, value_name)
            
            # Add display name string
            ET.SubElement(string_table, 'string', {
                'id': policy_name
            }).text = value_name if value_name else "Default Value"
            
            # Add explanation string
            ET.SubElement(string_table, 'string', {
                'id': f"{policy_name}_Explain"
            }).text = f"Configure the {value_name if value_name else 'default'} setting for {key_path}"
    
    # Add presentationTable
    presentation_table = ET.SubElement(resources, 'presentationTable')
    
    # Add presentation for each policy
    for entry in registry_entries:
        key_path = entry['key']
        
        for value in entry['values']:
            value_name = value['name']
            value_type = value['type'].lower()
            policy_name = generate_policy_name(key_path, value_name)
            
            # Create presentation element
            presentation = ET.SubElement(presentation_table, 'presentation', {
                'id': policy_name
            })
            
            # Handle different value types with correctly placed labels
            if value_type == 'string':
                # Create a textBox with the label inside it
                textBox = ET.SubElement(presentation, 'textBox', {
                    'refId': policy_name
                })
                label = ET.SubElement(textBox, 'label')
                label.text = f"Enter value for {value_name if value_name else 'default value'}"
                
            elif value_type == 'integer' or value_type == 'dword':
                # For boolean values (0/1), we might not need a presentation
                if value['value'] != '0' and value['value'] != '1':
                    # Create a decimalTextBox with the label inside it
                    decimalTextBox = ET.SubElement(presentation, 'decimalTextBox', {
                        'refId': policy_name
                    })
                    label = ET.SubElement(decimalTextBox, 'label')
                    label.text = f"Enter numeric value for {value_name if value_name else 'default value'}"
    
    # Create XML tree and write to file
    tree = ET.ElementTree(root)
    ET.indent(tree, space="  ")
    tree.write(output_file, encoding="utf-8", xml_declaration=True)

def main():
    # Default values
    app_name = "Sparrow"
    wxs_file = "input.wxs"
    
    # Get input from user
    print("WXS to ADMX/ADML Converter")
    print("==========================")
    
    # user_app_name = input(f"Enter application name [{app_name}]: ")
    # if user_app_name:
    #     app_name = user_app_name
    
    user_wxs_file = r"C:\\Users\\AshishRathore\\Desktop\\Sparrow\\sparrow-app\\apps\\@sparrow-desktop\\src-tauri\\assets\\DeepLinkRegistryEntries.wxs"
    if user_wxs_file:
        wxs_file = user_wxs_file
    
    # Make sure the input file exists
    if not os.path.exists(wxs_file):
        print(f"Error: File {wxs_file} not found.")
        return
    
    # Extract registry entries
    print("Extracting registry entries...")
    registry_entries = extract_registry_entries(wxs_file)
    print(f"Found {len(registry_entries)} registry keys with {sum(len(entry['values']) for entry in registry_entries)} values.")
    
    # Generate output filenames
    admx_file = f"{app_name.lower()}.admx"
    adml_file = f"{app_name.lower()}.adml"
    
    # Create ADMX file
    print(f"Creating ADMX file: {admx_file}")
    create_admx_file(app_name, registry_entries, admx_file)
    
    # Create ADML file
    print(f"Creating ADML file: {adml_file}")
    create_adml_file(app_name, registry_entries, adml_file)
    
    print("Conversion completed successfully!")

if __name__ == "__main__":
    # Try to use the ET.indent function (Python 3.9+)
    if not hasattr(ET, 'indent'):
        # Define indent function for older Python versions
        def indent(elem, level=0):
            i = "\n" + level*"  "
            if len(elem):
                if not elem.text or not elem.text.strip():
                    elem.text = i + "  "
                if not elem.tail or not elem.tail.strip():
                    elem.tail = i
                for elem in elem:
                    indent(elem, level+1)
                if not elem.tail or not elem.tail.strip():
                    elem.tail = i
            else:
                if level and (not elem.tail or not elem.tail.strip()):
                    elem.tail = i
        ET.indent = indent
    
    main()