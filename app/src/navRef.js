import { createNavigationContainerRef } from '@react-navigation/native';

/** Lets code outside the navigator (the notifications sheet) switch tabs. */
export const navRef = createNavigationContainerRef();
export const goTo = (name) => { if (navRef.isReady()) navRef.navigate(name); };
