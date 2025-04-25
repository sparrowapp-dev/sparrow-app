import posthog from 'posthog-js'; 
let isInitialized = false; 
export const initPostHog = () => { 
  if (!isInitialized) { 
    posthog.init(import.meta.env.VITE_POSTHOG_CONNECTION_API_KEY, { 

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
