import { HtmlRenderer} from '@sparrow/library/ui'; // Adjust import based on your package structure
import SvelteMarkdown from 'svelte-markdown';

export default {
  title: 'Components/Spacing',
  component: HtmlRenderer,
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'text' }, // Allow control over markdown input
  },
};

export const Padding = {
    args:{
        data:`
         <div style="margin: 0; padding: 0; font-family: Roboto, sans-serif; background-color: #0B0C0F; color: #D8D8D9;">
    
    <div style="text-align: center; margin: auto; padding: 32px; background: #181A20;">
        <h1 style="font-size: 48px; font-weight: 600; line-height: 72px; margin: 0; color: white;">
            Padding, Margin & Gap
        </h1>
    </div>


  
    <div style="padding: 32px; max-width: 1200px; margin: auto;">
       
        <div style="margin-bottom: 32px;">
            <h2 style="font-size: 32px; font-weight: 600; line-height: 48px; color: white; margin-bottom: 16px;">
                Introduction
            </h2>
            <p style="font-size: 24px; line-height: 36px;">
                Spacing is a fundamental aspect of design that ensures balance, clarity, and visual appeal in interfaces. Proper use of spacing helps in organizing content, improving readability, and creating a harmonious layout for elements or components.
            </p>
        </div>

       
        <div style="margin-bottom: 32px;">
            <h2 style="font-size: 32px; font-weight: 600; line-height: 48px; color: white; margin-bottom: 16px;">
                Spacing Formula
            </h2>
            <p style="font-size: 24px; line-height: 36px;">
                The formula for calculating spacing based on a multiplier is straightforward:
            </p>
            <p style="font-size: 24px; line-height: 36px; color: #8AACFA; font-weight: 600;">
                Spacing Value (px) = Base Unit (8px) × Multiplier
            </p>
            <p style="font-size: 24px; line-height: 36px;">
                Base Unit = 8px<br>
                Multiplier = Defined scaling value (progressively increasing)<br>
                Example: If the multiplier is 0.5, the spacing value is calculated as:<br>
                <span style="color: #8AACFA; font-weight: 700;">8 × 0.5 = 4px</span>
            </p>
        </div>

        <div style="margin-bottom: 32px; height: auto;">
            <h2 style="font-size: 32px; font-weight: 600; line-height: 48px; color: white; margin-bottom: 16px;">
                Usage
            </h2>
            <p style="font-size: 24px; line-height: 36px;">
                Padding is space inside an element, between its content and boundary. For example, adding padding to a button makes it feel more clickable. Here are common padding directions:
            </p>
            <ul style="padding-left: 40px; font-size: 24px; line-height: 36px;">
                <li>padding-top (pt): Space at the top of the content.</li>
                <li>padding-right (pr): Space on the right side.</li>
                <li>padding-bottom (pb): Space at the bottom.</li>
                <li>padding-left (pl): Space on the left side.</li>
                <li>padding-top-bottom (py): Space on the top and bottom.</li>
                <li>padding-left-right (px): Space on the left and right.</li>
            </ul>

            <div style="align-self: stretch; height: auto; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex; width:auto ; padding-bottom: 30px;">
                <div style="align-self: stretch; border-radius: 2px; justify-content: flex-start; align-items: flex-start; display: inline-flex">
                    <div style="flex: 1 1 0; padding-bottom: 4px; background: #1D212B; border-top-left-radius: 2px; border: 1px #31353F solid; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 40px; padding-left: 12px; padding-right: 12px; padding-top: 8px; padding-bottom: 8px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Name</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; padding-bottom: 4px; background: #1D212B; border: 1px #31353F solid; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 40px; padding-left: 12px; padding-right: 12px; padding-top: 8px; padding-bottom: 8px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Padding Value</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; padding-bottom: 4px; background: #1D212B; border: 1px #31353F solid; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 40px; padding-left: 12px; padding-right: 12px; padding-top: 8px; padding-bottom: 8px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Usage</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">padding-0</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">0 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 72px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Used for components that do not require padding (e.g., plain text elements or tight content alignment).</div>
                        </div>
                    </div>
                </div>
               
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">padding-56</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">56 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 72px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Used for extra-large containers or panels requiring significant white space for readability.</div>
                        </div>
                    </div>
                </div>
            </div>

            
            <div style="width: 815px"><span style="color: white; font-size: 24px; font-family: Roboto; font-weight: 400; line-height: 36px; word-wrap: break-word">Margin directions define the outer spacing for an element:<br/></span><span style="color: white; font-size: 24px; font-family: Roboto; font-weight: 700; line-height: 36px; word-wrap: break-word">margin-top (mt): </span><span style="color: white; font-size: 24px; font-family: Roboto; font-weight: 400; line-height: 36px; word-wrap: break-word">Space at the top.<br/></span><span style="color: white; font-size: 24px; font-family: Roboto; font-weight: 700; line-height: 36px; word-wrap: break-word">margin-right (mr): </span><span style="color: white; font-size: 24px; font-family: Roboto; font-weight: 400; line-height: 36px; word-wrap: break-word">Space on the right side.<br/></span><span style="color: white; font-size: 24px; font-family: Roboto; font-weight: 700; line-height: 36px; word-wrap: break-word">margin-bottom (mb): </span><span style="color: white; font-size: 24px; font-family: Roboto; font-weight: 400; line-height: 36px; word-wrap: break-word">Space at the bottom</span><span style="color: white; font-size: 24px; font-family: Roboto; font-weight: 700; line-height: 36px; word-wrap: break-word">.<br/>margin-left (ml): </span><span style="color: white; font-size: 24px; font-family: Roboto; font-weight: 400; line-height: 36px; word-wrap: break-word">Space on the left side.<br/></span><span style="color: white; font-size: 24px; font-family: Roboto; font-weight: 700; line-height: 36px; word-wrap: break-word">margin-top-bottom (my): </span><span style="color: white; font-size: 24px; font-family: Roboto; font-weight: 400; line-height: 36px; word-wrap: break-word">Space on the top and bottom.<br/></span><span style="color: white; font-size: 24px; font-family: Roboto; font-weight: 700; line-height: 36px; word-wrap: break-word">margin-left-right (mx): </span><span style="color: white; font-size: 24px; font-family: Roboto; font-weight: 400; line-height: 36px; word-wrap: break-word">Space on the left and right.</span></div>
       
            <div style="align-self: stretch; height: auto; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex; width:auto">
                <div style="align-self: stretch; border-radius: 2px; justify-content: flex-start; align-items: flex-start; display: inline-flex; ">
                    <div style="flex: 1 1 0; padding-bottom: 4px; background: #1D212B; border-top-left-radius: 2px; border: 1px #31353F solid; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: inline-flex ">
                        <div style="align-self: stretch; height: 40px; padding-left: 12px; padding-right: 12px; padding-top: 8px; padding-bottom: 8px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Name</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; padding-bottom: 4px; background: #1D212B; border: 1px #31353F solid; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 40px; padding-left: 12px; padding-right: 12px; padding-top: 8px; padding-bottom: 8px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Margin Value</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; padding-bottom: 4px; background: #1D212B; border: 1px #31353F solid; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 40px; padding-left: 12px; padding-right: 12px; padding-top: 8px; padding-bottom: 8px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Usage</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; padding: 12px; justify-content: flex-start; align-items: flex-start; gap: 12px; display: inline-flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">margin-auto</div>
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">/</div>
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">margin-justify</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; justify-content: flex-start; align-items: center; display: flex">
                        <div style="flex: 1 1 0; height: 48px; padding: 12px; justify-content: flex-start; align-items: flex-start; gap: 12px; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">auto</div>
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">/</div>
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">space-between</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 72px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Used to center components or dynamically align elements in containers.</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">margin-16</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">16 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Used for small to medium-sized devices</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">margin-24</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">24 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 72px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Ideal for medium to large devices, used between sections or to add breathing space.</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">margin-32</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">32 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 72px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Applied for larger spacing on desktops, especially for section margins or wider containers.</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">margin-40</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">40 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Used for extra-large spacing</div>
                        </div>
                    </div>
                </div>
            </div>


            <div style="width: auto; height: auto; justify-content: space-between; align-items: center; display: inline-flex; margin-top: 30px;">
                <div style="width: auto"><span style="color: #D8D8D9; font-size: 24px; font-family: Roboto; font-weight: 700; line-height: 36px; word-wrap: break-word">Gap:
                  </span><span style="color: #D8D8D9; font-size: 24px; font-family: Roboto; font-weight: 400; line-height: 36px; word-wrap: break-word">Space between items in grids or flex containers, eliminating the need for manual adjustments.</span></div>
               
            </div>

            <div style="width: auto; margin-top: 30px;">
                <span style="color: #D8D8D9; font-size: 24px; font-family: Roboto; font-weight: 400; line-height: 36px; word-wrap: break-word;">
                  Gap is primarily used in grid or flex layouts and specifies spacing between child elements.
                  <br/>
                </span>
                <span style="color: #D8D8D9; font-size: 24px; font-family: Roboto; font-weight: 700; line-height: 36px; word-wrap: break-word;">
                  row-gap: 
                </span>
                <span style="color: #D8D8D9; font-size: 24px; font-family: Roboto; font-weight: 400; line-height: 36px; word-wrap: break-word;">
                  Space between rows in a grid or flex container.
                  <br/>
                </span>
                <span style="color: #D8D8D9; font-size: 24px; font-family: Roboto; font-weight: 700; line-height: 36px; word-wrap: break-word;">
                  column-gap: 
                </span>
                <span style="color: #D8D8D9; font-size: 24px; font-family: Roboto; font-weight: 400; line-height: 36px; word-wrap: break-word;">
                  Space between columns in a grid or flex container.
                  <br/>
                </span>
                <span style="color: #D8D8D9; font-size: 24px; font-family: Roboto; font-weight: 700; line-height: 36px; word-wrap: break-word;">
                  gap: 
                </span>
                <span style="color: #D8D8D9; font-size: 24px; font-family: Roboto; font-weight: 400; line-height: 36px; word-wrap: break-word;">
                  Combined shorthand for row and column gaps.
                </span>
              </div>

              <div style="align-self: stretch; height: auto; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex; width:auto ; margin-top: 30px;">
                <div style="align-self: stretch; border-radius: 2px; justify-content: flex-start; align-items: flex-start; display: inline-flex">
                    <div style="flex: 1 1 0; padding-bottom: 4px; background: #1D212B; border-top-left-radius: 2px; border: 1px #31353F solid; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 40px; padding-left: 12px; padding-right: 12px; padding-top: 8px; padding-bottom: 8px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Name</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; padding-bottom: 4px; background: #1D212B; border: 1px #31353F solid; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 40px; padding-left: 12px; padding-right: 12px; padding-top: 8px; padding-bottom: 8px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Gap Value</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; padding-bottom: 4px; background: #1D212B; border: 1px #31353F solid; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 40px; padding-left: 12px; padding-right: 12px; padding-top: 8px; padding-bottom: 8px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Usage</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">gap-0</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">0 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Used for no gap</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">gap-2 </div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">2 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Use for minimal gaps, such as between grouped items.</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">gap-4</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">4 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Use for small gaps in tightly packed grids or flex items.</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">gap-8</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">8 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 72px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Standard gap for spacing between elements in grids or flex layouts.</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">gap-12</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">12 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Use for moderate spacing in grid or card layouts.</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">gap-16</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">16 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Ideal for larger gaps, ensuring proper separation in layouts.</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">gap-20</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">20 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Use for significant gaps between larger elements or sections.</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">gap-24</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">24 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Use for significant gaps between larger elements or sections.</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">gap-32</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">32 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 72px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Suitable for wide separations in complex grids or flex containers.</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">gap-36</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">36 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 72px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">Used for extra-large components like containers or large panels.</div>
                        </div>
                    </div>
                </div>
                <div style="align-self: stretch; background: #14181F; justify-content: flex-start; align-items: center; display: inline-flex">
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">gap-40</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 48px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">40 px</div>
                        </div>
                    </div>
                    <div style="flex: 1 1 0; align-self: stretch; border-left: 1px #31353F solid; border-right: 1px #31353F solid; border-bottom: 1px #31353F solid; flex-direction: column; justify-content: center; align-items: flex-start; display: inline-flex">
                        <div style="align-self: stretch; height: 72px; padding: 12px; flex-direction: column; justify-content: flex-start; align-items: flex-start; display: flex">
                            <div style="align-self: stretch; color: white; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word">For the largest gaps in design layouts, such as between full-width sections.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        </div>
        

        `},
    };


export const CornerRadius = {
  args: {
    data: `
     <div style ="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0B0C0F; color: #ffffff; line-height: 1.6; width:auto">
    <div style="width: 800px; margin: 0 auto; padding: 2rem;">
        <!-- Header Section -->
        <div style="margin-bottom: 4rem;">
            <h1 style="font-size: 2.5rem; font-weight: 600; margin-bottom: 1.5rem; color: #ffffff;">Corner Radius</h1>
            <p style="font-size: 1.25rem; color: #D8D8D9; margin-bottom: 1rem;">
                The corner radius is a design element used to soften the sharp edges of a rectangular shape,
                making it more visually appealing and user-friendly.
            </p>
            <p style="font-size: 1.25rem; color: #D8D8D9;">
                <strong>Common alternative names: </strong>
                Border radius, bevel, rounded corners
            </p>
        </div>

        <!-- Usage Section -->
        <div style="background: #14181F; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; border: 1px solid #31353F; width:800px;">
            <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; ">Usage</h2>
            <p style="font-size: 1.25rem; color: #D8D8D9;">
                The size of a component influences its corner radius values. Larger components that
                encompass other elements typically have greater corner radii to maintain a balanced and
                cohesive visual design.
            </p>
        </div>

        <!-- Table Section -->
        <div style="overflow-x: auto; margin: 2rem 0; background: #14181F; border-radius: 8px; border: 1px solid #31353F;  width:850px;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #1D212B;">
                        <th style="text-align: left; padding: 1rem; border-bottom: 1px solid #31353F;">Name</th>
                        <th style="text-align: left; padding: 1rem; border-bottom: 1px solid #31353F;">Value</th>
                        <th style="text-align: left; padding: 1rem; border-bottom: 1px solid #31353F;">Usage</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #31353F;">corner-radius-0</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #31353F;">0px</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #31353F;">Used for no corner radius (e.g., strict grid elements or sharp-edged designs).</td>
                    </tr>
                    <tr style="background: #1D212B;">
                        <td style="padding: 1rem; border-bottom: 1px solid #31353F;">corner-radius-2</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #31353F;">2px</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #31353F;">Used for small components like small to medium buttons, dropdowns, and input fields.</td>
                    </tr>
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #31353F;">corner-radius-4</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #31353F;">4px</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #31353F;">Used for medium components like dropdown modals, medium buttons, and small tooltips.</td>
                    </tr>
                    <tr style="background: #1D212B;">
                        <td style="padding: 1rem; border-bottom: 1px solid #31353F;">corner-radius-8</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #31353F;">8px</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #31353F;">Used for larger components like modals, toasters, and large buttons.</td>
                    </tr>
                    <tr>
                        <td style="padding: 1rem; border-bottom: 1px solid #31353F;">corner-radius-12</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #31353F;">12px</td>
                        <td style="padding: 1rem; border-bottom: 1px solid #31353F;">Used for extra-large components like containers or large panels.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Examples Section -->
        <h2 style="font-size: 1.5rem; font-weight: 600; margin: 2rem 0;">Examples</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;  width:800px;">
            <!-- Example 1: Button -->
            <div style="background: #14181F; border-radius: 8px; padding: 1.5rem; border: 1px solid #31353F;">
                <button style="display: inline-flex; align-items: center; padding: 0.5rem 1rem; background: #3670F7; color: white; border-radius: 4px; border: none; cursor: pointer;">
                    Primary Button
                </button>
                <div style="color: #8A9299; font-size: 0.875rem; margin-top: 0.5rem;">corner-radius-4</div>
            </div>

            <!-- Example 2: Modal -->
            <div style="background: #14181F; border-radius: 8px; padding: 1.5rem; border: 1px solid #31353F;">
                <div style="background: #1D212B; padding: 1.5rem; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size: 1.25rem; font-weight: 600;">Save Changes?</h3>
                        <span style="color: #8A9299; cursor: pointer;">✕</span>
                    </div>
                    <p style="color: #D8D8D9; margin-bottom: 1rem;">You have unsaved changes. Do you want to save them?</p>
                    <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                        <button style="padding: 0.5rem 1rem; background: #2A2F3A; color: white; border-radius: 4px; border: none; cursor: pointer;">Cancel</button>
                        <button style="padding: 0.5rem 1rem; background: #3670F7; color: white; border-radius: 4px; border: none; cursor: pointer;">Save</button>
                    </div>
                </div>
                <div style="color: #8A9299; font-size: 0.875rem; margin-top: 0.5rem;">corner-radius-8</div>
            </div>
        </div>
    </div>
    </div>`,
  },
};



