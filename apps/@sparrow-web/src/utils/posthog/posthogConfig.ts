import posthog from 'posthog-js'; 
import constants from "@app/constants/constants";
let isInitialized = false; 
export const initPostHog = () => { 
  if (!isInitialized) { 
    posthog.init(constants.ENABLE_POST_HOG, { 

      api_host: 'https://us.i.posthog.com', 

      person_profiles: 'always', 

    }); 
   
    isInitialized = true;  
    return true; 
  } 
  return false; 
}; 
export const captureEvent = ( 
  eventName: string, 
  properties?: Record<string, any> 
) => { 
  if (!isInitialized) { 
    console.warn('PostHog not initialized before capturing event'); 
    initPostHog();
  } 
  posthog.capture(eventName, properties); 
}; 
export const posthogClient = posthog; 
