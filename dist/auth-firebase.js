import {firebaseConfig, AUTH_EMULATOR_URL} from './auth-config.js';
let initialisation;
export function initialiseAuth() {
  if (!initialisation) initialisation = load().catch(error => {initialisation=undefined;throw error;});
  return initialisation;
}
async function load() {
  let appSDK, sdk;
  try {
    [appSDK,sdk]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js')
    ]);
  } catch(cause) {throw Object.assign(new Error('Authentication SDK could not load.'),{code:'auth/sdk-unavailable',cause});}
  const app=appSDK.getApps().length?appSDK.getApp():appSDK.initializeApp(firebaseConfig);
  const auth=sdk.getAuth(app);
  if(AUTH_EMULATOR_URL&&!auth.emulatorConfig)sdk.connectAuthEmulator(auth,AUTH_EMULATOR_URL,{disableWarnings:true});
  await sdk.setPersistence(auth,sdk.browserSessionPersistence);
  return {
    observe:(next,error)=>sdk.onAuthStateChanged(auth,next,error),
    signup:(email,password)=>sdk.createUserWithEmailAndPassword(auth,email,password),
    login:(email,password)=>sdk.signInWithEmailAndPassword(auth,email,password),
    profile:(user,name)=>sdk.updateProfile(user,{displayName:name}),
    verify:(user,language)=>{auth.languageCode=language;return sdk.sendEmailVerification(user);},
    reset:(email,language)=>{auth.languageCode=language;return sdk.sendPasswordResetEmail(auth,email);},
    reload:async user=>{await sdk.reload(user);return auth.currentUser;},
    logout:()=>sdk.signOut(auth)
  };
}
