// // src/App.jsx - FINAL CORRECTED AND FORMATTED VERSION

// import React, { useState, useEffect } from 'react';
// import './App.css';
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { createClient } from '@supabase/supabase-js';

// // Firebase Imports
// import { auth, db } from './firebase';
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc, setDoc, collection, addDoc, query, where, getDocs, orderBy, deleteDoc } from "firebase/firestore";

// // Gemini AI Setup
// const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// const genAI = new GoogleGenerativeAI(API_KEY);

// // Supabase Client Setup
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);


// //==================================================
// // Main App Component
// //==================================================
// function App() {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [userProfile, setUserProfile] = useState(null);
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [showProfileModal, setShowProfileModal] = useState(false);
//   const [isLoadingApp, setIsLoadingApp] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setCurrentUser(user);
//         const userDocRef = doc(db, "users", user.uid);
//         const userDocSnap = await getDoc(userDocRef);
//         if (userDocSnap.exists()) {
//           setUserProfile(userDocSnap.data());
//         } else {
//           setShowProfileModal(true);
//         }
//       } else {
//         setCurrentUser(null);
//         setUserProfile(null);
//       }
//       setIsLoadingApp(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   if (isLoadingApp) {
//     return <div>Loading App...</div>;
//   }

//   return (
//     <>
//       <Navbar user={currentUser} profile={userProfile} onLoginClick={() => setShowAuthModal(true)} onProfileClick={() => setShowProfileModal(true)} onLogout={() => signOut(auth)} />
      
//       {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
//       {showProfileModal && <ProfileModal user={currentUser} onClose={() => setShowProfileModal(false)} onSave={(profile) => setUserProfile(profile)} />}

//       <HeroSection />
      
//       <main className="container my-5">
//         {currentUser ? <PitchCraftApp user={currentUser} /> : <div className="alert alert-info text-center">Please login to create and save pitches.</div>}
//       </main>
      
//       <Footer />
//     </>
//   );
// }


// //==================================================
// // PITCHCRAFT APP LOGIC (THE CORE FUNCTIONALITY)
// //==================================================
// function PitchCraftApp({ user }) {
//   const [idea, setIdea] = useState('');
//   const [namePref, setNamePref] = useState('');
//   const [industry, setIndustry] = useState('');
//   const [tone, setTone] = useState('professional');
//   const [generatedPitch, setGeneratedPitch] = useState(null);
//   const [savedPitches, setSavedPitches] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
  
//   useEffect(() => {
//     const fetchPitches = async () => {
//       if (!user) return;
//       const q = query(collection(db, "pitches"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
//       const querySnapshot = await getDocs(q);
//       setSavedPitches(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
//     };
//     fetchPitches();
//   }, [user]);

//   const handleGeneratePitch = async () => {
//     if (!idea) return alert("Please enter your idea!");
//     setIsLoading(true);
//     setGeneratedPitch(null);

//     try {
//       // === YEH LINE THEEK KAR DI GAYI HAI ===
//       const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
//       const prompt = `Generate a startup pitch as a JSON object with keys "name", "tagline", "pitch", "problem", "solution". Base it on this idea: "${idea}", preferred name: "${namePref}", industry: "${industry}", and use a ${tone} tone.`;
      
//       const result = await model.generateContent(prompt);
//       const text = (await result.response.text()).replace(/```json/g, '').replace(/```/g, '').trim();
//       const pitchObject = JSON.parse(text);
//       setGeneratedPitch(pitchObject);
//     } catch (err) {
//       alert("Error generating pitch. Please try again.");
//     }
//     setIsLoading(false);
//   };

//   const savePitch = async (pitchToSave) => {
//     const newPitch = { ...pitchToSave, userId: user.uid, createdAt: new Date() };
//     const docRef = await addDoc(collection(db, "pitches"), newPitch);
//     setSavedPitches([{ ...newPitch, id: docRef.id }, ...savedPitches]);
//     alert('Pitch saved to your account!');
//   };
  
//   const deletePitch = async (id) => {
//     if (!window.confirm('Delete this pitch?')) return;
//     await deleteDoc(doc(db, "pitches", id));
//     setSavedPitches(savedPitches.filter(p => p.id !== id));
//   };
  
//   const editPitch = (id) => {
//     const pitchToEdit = savedPitches.find(p => p.id === id);
//     setGeneratedPitch(pitchToEdit);
//   };

//   return (
//     <>
//       <section id="create" className="card p-4 shadow-sm mb-5">
//         <h3>Create Pitch / Pitch Banayein</h3>
//         <div className="row g-3 mt-2">
//           <div className="col-12"><label className="form-label">Idea / Short Description</label><textarea value={idea} onChange={e => setIdea(e.target.value)} className="form-control" rows="3"></textarea></div>
//           <div className="col-md-4"><label className="form-label">Tone</label><select value={tone} onChange={e => setTone(e.target.value)} className="form-select"><option value="professional">Professional</option><option value="friendly">Friendly</option></select></div>
//           <div className="col-md-8 d-flex align-items-end"><button onClick={handleGeneratePitch} className="btn btn-primary me-2" disabled={isLoading}>{isLoading ? 'Generating...' : 'Generate Pitch'}</button></div>
//         </div>

//         {generatedPitch && (
//           <div className="mt-4">
//             <h5>Generated Pitch</h5>
//             <p><strong>Name:</strong> {generatedPitch.name}</p>
//             <p><strong>Tagline:</strong> {generatedPitch.tagline}</p>
//             <p><strong>Pitch:</strong> {generatedPitch.pitch}</p>
//             <button onClick={() => savePitch(generatedPitch)} className="btn btn-success">Save to Dashboard</button>
//           </div>
//         )}
//       </section>

//       <section id="dashboard">
//         <h3>Saved Pitches / Dashboard</h3>
//         <div className="row g-3 mt-2">
//           {savedPitches.map(p => (
//             <div key={p.id} className="col-md-6">
//               <div className="card p-3 h-100">
//                 <h5>{p.name}</h5>
//                 <p className="small text-muted">{p.tagline}</p>
//                 <div className="mt-auto pt-2"><button onClick={() => editPitch(p.id)} className="btn btn-sm btn-outline-primary me-1">View/Edit</button><button onClick={() => deletePitch(p.id)} className="btn btn-sm btn-outline-danger">Delete</button></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>
//     </>
//   );
// }


// // --- Baqi saare components ---
// const Navbar = ({ user, profile, onLoginClick, onProfileClick, onLogout }) => (
//     <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
//         <div className="container">
//             <a className="navbar-brand brand" href="#">PitchCraft</a>
//             {user ? (
//                 <div className="d-flex align-items-center gap-3">
//                     <div className="navbar-profile" onClick={onProfileClick}>
//                         <img src={profile?.photoURL || 'https://via.placeholder.com/40'} alt="Profile" className="profile-pic" />
//                         <span>{profile?.displayName || 'Profile'}</span>
//                     </div>
//                     <button onClick={onLogout} className="btn btn-outline-danger btn-sm">Logout</button>
//                 </div>
//             ) : (
//                 <button onClick={onLoginClick} className="btn btn-primary btn-sm">Login / Signup</button>
//             )}
//         </div>
//     </nav>
// );

// const AuthModal = ({ onClose }) => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [isLogin, setIsLogin] = useState(true);

//     const handleAuth = async () => {
//         try {
//             if (isLogin) {
//                 await signInWithEmailAndPassword(auth, email, password);
//             } else {
//                 await createUserWithEmailAndPassword(auth, email, password);
//             }
//             onClose();
//         } catch (error) {
//             alert(error.message);
//         }
//     };

//     return (
//         <div className="modal show d-block">
//             <div className="modal-dialog modal-dialog-centered">
//                 <div className="modal-content">
//                     <div className="modal-header">
//                         <h5 className="modal-title">{isLogin ? 'Login' : 'Sign Up'}</h5>
//                         <button type="button" className="btn-close" onClick={onClose}></button>
//                     </div>
//                     <div className="modal-body">
//                         <input className="form-control mb-2" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
//                         <input className="form-control mb-3" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
//                         <button className="btn btn-primary w-100" onClick={handleAuth}>{isLogin ? 'Login' : 'Sign Up'}</button>
//                     </div>
//                     <div className="modal-footer justify-content-center">
//                         <p className="mb-0 small" style={{ cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
//                             {isLogin ? "Need an account? Sign Up" : "Have an account? Login"}
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const ProfileModal = ({ user, onClose, onSave }) => {
//     const [displayName, setDisplayName] = useState('');
//     const [profilePicFile, setProfilePicFile] = useState(null);
//     const [isSaving, setIsSaving] = useState(false);

//     const handleSaveProfile = async () => {
//         if (!displayName) return alert('Display Name is required.');
//         setIsSaving(true);
//         let photoURL = user.photoURL || 'https://via.placeholder.com/150';

//         if (profilePicFile) {
//             const reader = new FileReader();
//             reader.readAsDataURL(profilePicFile);
//             reader.onloadend = async () => {
//                 const fileDataURL = reader.result;
//                 try {
//                     const { data, error } = await supabase.functions.invoke('upload-image', { body: { fileDataURL } });
//                     if (error) throw error;
//                     photoURL = data.url;
//                     await saveProfileToFirestore(photoURL);
//                 } catch (err) {
//                     alert('Image upload failed: ' + err.message);
//                     setIsSaving(false);
//                 }
//             };
//         } else {
//             await saveProfileToFirestore(photoURL);
//         }
//     };

//     const saveProfileToFirestore = async (finalPhotoURL) => {
//         const userProfileData = { displayName, photoURL: finalPhotoURL, email: user.email };
//         await setDoc(doc(db, "users", user.uid), userProfileData);
//         onSave(userProfileData);
//         setIsSaving(false);
//         onClose();
//     };

//     return (
//         <div className="modal show d-block">
//             <div className="modal-dialog modal-dialog-centered">
//                 <div className="modal-content">
//                     <div className="modal-header">
//                         <h5 className="modal-title">Complete Your Profile</h5>
//                         <button type="button" className="btn-close" onClick={onClose}></button>
//                     </div>
//                     <div className="modal-body">
//                         <label className="form-label">Display Name</label>
//                         <input className="form-control mb-2" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Ali Khan" />
//                         <label className="form-label">Profile Picture</label>
//                         <input className="form-control mb-3" type="file" onChange={e => setProfilePicFile(e.target.files[0])} accept="image/png, image/jpeg" />
//                     </div>
//                     <div className="modal-footer">
//                         <button className="btn btn-primary" onClick={handleSaveProfile} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Profile'}</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const HeroSection = () => (
//     <header className="hero">
//         <div className="container">
//             <h1>AI that writes your startup pitch</h1>
//             <p className="lead text-muted">Turn your idea into a professional pitch in minutes.</p>
//         </div>
//     </header>
// );

// const Footer = () => (
//     <footer className="container border-top pt-4 pb-5 mt-5 text-muted small">
//         <p>PitchCraft — Final Demo</p>
//     </footer>
// );

// export default App;
// src/App.jsx

// src/App.jsx - FINAL VERSION WITHOUT IMAGE UPLOAD
// src/App.jsx - FINAL VERSION WITHOUT ANY PROFILE MODAL

// import React, { useState, useEffect } from 'react';
// import './App.css';
// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Firebase Imports
// import { auth, db } from './firebase';
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc, setDoc, collection, addDoc, query, where, getDocs, orderBy, deleteDoc } from "firebase/firestore";

// // Gemini AI Setup
// const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// const genAI = new GoogleGenerativeAI(API_KEY);

// //==================================================
// // Main App Component
// //==================================================
// function App() {
//   const [currentUser, setCurrentUser]  = useState(null);
//   const [userProfile, setUserProfile] = useState(null);
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [isLoadingApp, setIsLoadingApp] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setCurrentUser(user);
//         // User login hai, uski profile (agar hai) to fetch karo
//         const userDocRef = doc(db, "users", user.uid);
//         const userDocSnap = await getDoc(userDocRef);
//         if (userDocSnap.exists()) {
//           setUserProfile(userDocSnap.data());
//         }
//       } else {
//         setCurrentUser(null);
//         setUserProfile(null);
//       }
//       setIsLoadingApp(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   if (isLoadingApp) {
//     return <div>Loading App...</div>;
//   }

//   return (
//     <>
//       <Navbar user={currentUser} profile={userProfile} onLoginClick={() => setShowAuthModal(true)} onLogout={() => signOut(auth)} />
      
//       {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      
//       {/* ProfileModal ko yahan se hata diya gaya hai */}

//       <HeroSection />
      
//       <main className="container my-5">
//         {currentUser ? <PitchCraftApp user={currentUser} /> : <div className="alert alert-info text-center">Please login to create and save pitches.</div>}
//       </main>
      
//       <Footer />
//     </>
//   );
// }


// //==================================================
// // PITCHCRAFT APP LOGIC (THE CORE FUNCTIONALITY)
// //==================================================
// function PitchCraftApp({ user }) {
//   const [idea, setIdea] = useState('');
//   const [tone, setTone] = useState('professional');
//   const [generatedPitch, setGeneratedPitch] = useState(null);
//   const [savedPitches, setSavedPitches] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
  
//   useEffect(() => {
//     const fetchPitches = async () => {
//       if (!user) return;
//       const q = query(collection(db, "pitches"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
//       const querySnapshot = await getDocs(q);
//       setSavedPitches(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
//     };
//     fetchPitches();
//   }, [user]);

//   const handleGeneratePitch = async () => {
//     if (!idea) return alert("Please enter your idea!");
//     setIsLoading(true);
//     setGeneratedPitch(null);

//     try {
//       const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
//       const prompt = `Generate a startup pitch as a JSON object with keys "name", "tagline", "pitch", "problem", "solution". Base it on this idea: "${idea}" and use a ${tone} tone.`;
      
//       const result = await model.generateContent(prompt);
//       const text = (await result.response.text()).replace(/```json/g, '').replace(/```/g, '').trim();
//       const pitchObject = JSON.parse(text);
//       setGeneratedPitch(pitchObject);
//     } catch (err) {
//       alert("Error generating pitch. Please try again.");
//     }
//     setIsLoading(false);
//   };

//   const savePitch = async (pitchToSave) => {
//     const newPitch = { ...pitchToSave, userId: user.uid, createdAt: new Date() };
//     const docRef = await addDoc(collection(db, "pitches"), newPitch);
//     setSavedPitches([{ ...newPitch, id: docRef.id }, ...savedPitches]);
//     alert('Pitch saved to your account!');
//   };
  
//   const deletePitch = async (id) => {
//     if (!window.confirm('Delete this pitch?')) return;
//     await deleteDoc(doc(db, "pitches", id));
//     setSavedPitches(savedPitches.filter(p => p.id !== id));
//   };
  
//   const editPitch = (id) => {
//     const pitchToEdit = savedPitches.find(p => p.id === id);
//     setGeneratedPitch(pitchToEdit);
//   };

//   return (
//     <>
//       <section id="create" className="card p-4 shadow-sm mb-5">
//         <h3>Create Pitch / Pitch Banayein</h3>
//         <div className="row g-3 mt-2">
//           <div className="col-12"><label className="form-label">Idea / Short Description</label><textarea value={idea} onChange={e => setIdea(e.target.value)} className="form-control" rows="3"></textarea></div>
//           <div className="col-md-4"><label className="form-label">Tone</label><select value={tone} onChange={e => setTone(e.target.value)} className="form-select"><option value="professional">Professional</option><option value="friendly">Friendly</option></select></div>
//           <div className="col-md-8 d-flex align-items-end"><button onClick={handleGeneratePitch} className="btn btn-primary me-2" disabled={isLoading}>{isLoading ? 'Generating...' : 'Generate Pitch'}</button></div>
//         </div>

//         {generatedPitch && (
//           <div className="mt-4">
//             <h5>Generated Pitch</h5>
//             <p><strong>Name:</strong> {generatedPitch.name}</p>
//             <p><strong>Tagline:</strong> {generatedPitch.tagline}</p>
//             <p><strong>Pitch:</strong> {generatedPitch.pitch}</p>
//             <button onClick={() => savePitch(generatedPitch)} className="btn btn-success">Save to Dashboard</button>
//           </div>
//         )}
//       </section>

//       <section id="dashboard">
//         <h3>Saved Pitches / Dashboard</h3>
//         <div className="row g-3 mt-2">
//           {savedPitches.map(p => (
//             <div key={p.id} className="col-md-6">
//               <div className="card p-3 h-100">
//                 <h5>{p.name}</h5>
//                 <p className="small text-muted">{p.tagline}</p>
//                 <div className="mt-auto pt-2"><button onClick={() => editPitch(p.id)} className="btn btn-sm btn-outline-primary me-1">View/Edit</button><button onClick={() => deletePitch(p.id)} className="btn btn-sm btn-outline-danger">Delete</button></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>
//     </>
//   );
// }

// // --- Baqi saare components ---
// const Navbar = ({ user, profile, onLoginClick, onLogout }) => (
//     <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
//         <div className="container">
//             <a className="navbar-brand brand" href="#">PitchCraft</a>
//             {user ? (
//                 <div className="d-flex align-items-center gap-3">
//                     <div className="navbar-profile">
//                         <img src={profile?.photoURL || 'https://dummyimage.com/40x40/ced4da/6c757d.png&text=+'} alt="Profile" className="profile-pic" />
//                         <span>{profile?.displayName || user.email}</span>
//                     </div>
//                     <button onClick={onLogout} className="btn btn-outline-danger btn-sm">Logout</button>
//                 </div>
//             ) : (
//                 <button onClick={onLoginClick} className="btn btn-primary btn-sm">Login / Signup</button>
//             )}
//         </div>
//     </nav>
// );

// const AuthModal = ({ onClose }) => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [isLogin, setIsLogin] = useState(true);

//     const handleAuth = async () => {
//         try {
//             if (isLogin) {
//                 await signInWithEmailAndPassword(auth, email, password);
//             } else {
//                 await createUserWithEmailAndPassword(auth, email, password);
//             }
//             onClose();
//         } catch (error) {
//             alert(error.message);
//         }
//     };

//     return (
//         <div className="modal show d-block">
//             <div className="modal-dialog modal-dialog-centered">
//                 <div className="modal-content">
//                     <div className="modal-header">
//                         <h5 className="modal-title">{isLogin ? 'Login' : 'Sign Up'}</h5>
//                         <button type="button" className="btn-close" onClick={onClose}></button>
//                     </div>
//                     <div className="modal-body">
//                         <input className="form-control mb-2" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
//                         <input className="form-control mb-3" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
//                         <button className="btn btn-primary w-100" onClick={handleAuth}>{isLogin ? 'Login' : 'Sign Up'}</button>
//                     </div>
//                     <div className="modal-footer justify-content-center">
//                         <p className="mb-0 small" style={{ cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
//                             {isLogin ? "Need an account? Sign Up" : "Have an account? Login"}
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // PROFILE MODAL KO MUKAMMAL TAUR PAR HATA DIYA GAYA HAI

// const HeroSection = () => (
//     <header className="hero">
//         <div className="container">
//             <h1>AI that writes your startup pitch</h1>
//             <p className="lead text-muted">Turn your idea into a professional pitch in minutes.</p>
//         </div>
//     </header>
// );

// const Footer = () => (
//     <footer className="container border-top pt-4 pb-5 mt-5 text-muted small">
//         <p>PitchCraft — Final Demo</p>
//     </footer>
// );

// export default App;

import React, { useState, useEffect } from 'react';
import './App.css';
// import { GoogleGenerativeAI } from "@google/generative-ai"; // <--- IS LINE KO HATA DEIN

// Firebase Imports
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, collection, addDoc, query, where, getDocs, orderBy, deleteDoc } from "firebase/firestore";

// Gemini AI Setup (Ye code ab front-end mein nahi chahiye)
// const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // <--- IS LINE KO HATA DEIN
// const genAI = new GoogleGenerativeAI(API_KEY); // <--- IS LINE KO HATA DEIN

//==================================================
// Main App Component
//==================================================
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoadingApp, setIsLoadingApp] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // User login hai, uski profile (agar hai) to fetch karo
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data());
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setIsLoadingApp(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoadingApp) {
    return <div>Loading App...</div>;
  }

  return (
    <>
      <Navbar user={currentUser} profile={userProfile} onLoginClick={() => setShowAuthModal(true)} onLogout={() => signOut(auth)} />

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* ProfileModal ko yahan se hata diya gaya hai */}

      <HeroSection />

      <main className="container my-5">
        {currentUser ? <PitchCraftApp user={currentUser} /> : <div className="alert alert-info text-center">Please login to create and save pitches.</div>}
      </main>

      <Footer />
    </>
  );
}


//==================================================
// PITCHCRAFT APP LOGIC (THE CORE FUNCTIONALITY)
//==================================================
function PitchCraftApp({ user }) {
  const [idea, setIdea] = useState('');
  const [tone, setTone] = useState('professional');
  const [generatedPitch, setGeneratedPitch] = useState(null);
  const [savedPitches, setSavedPitches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPitches = async () => {
      if (!user) return;
      const q = query(collection(db, "pitches"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      setSavedPitches(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    fetchPitches();
  }, [user]);

  const handleGeneratePitch = async () => {
    if (!idea) return alert("Please enter your idea!");
    setIsLoading(true);
    setGeneratedPitch(null);

    try {
      // <--- YE WALAH SECTION BADLEGA ---
      // Ab hum serverless function ko call karenge
      const response = await fetch('/api/generate-pitch', { // <--- Yahan naya endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea, tone }), // Idea aur tone ko serverless function ko bhej rahe hain
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate pitch on server.');
      }

      const data = await response.json();
      const pitchObject = JSON.parse(data.text); // Serverless function se JSON string aayegi
      setGeneratedPitch(pitchObject);

    } catch (err) {
      console.error("Error generating pitch:", err); // Debugging ke liye
      alert(`Error generating pitch: ${err.message}. Please try again.`);
    }
    setIsLoading(false);
  };

  const savePitch = async (pitchToSave) => {
    const newPitch = { ...pitchToSave, userId: user.uid, createdAt: new Date() };
    const docRef = await addDoc(collection(db, "pitches"), newPitch);
    setSavedPitches([{ ...newPitch, id: docRef.id }, ...savedPitches]);
    alert('Pitch saved to your account!');
  };

  const deletePitch = async (id) => {
    if (!window.confirm('Delete this pitch?')) return;
    await deleteDoc(doc(db, "pitches", id));
    setSavedPitches(savedPitches.filter(p => p.id !== id));
  };

  const editPitch = (id) => {
    const pitchToEdit = savedPitches.find(p => p.id === id);
    setGeneratedPitch(pitchToEdit);
  };

  return (
    <>
      <section id="create" className="card p-4 shadow-sm mb-5">
        <h3>Create Pitch / Pitch Banayein</h3>
        <div className="row g-3 mt-2">
          <div className="col-12"><label className="form-label">Idea / Short Description</label><textarea value={idea} onChange={e => setIdea(e.target.value)} className="form-control" rows="3"></textarea></div>
          <div className="col-md-4"><label className="form-label">Tone</label><select value={tone} onChange={e => setTone(e.target.value)} className="form-select"><option value="professional">Professional</option><option value="friendly">Friendly</option></select></div>
          <div className="col-md-8 d-flex align-items-end"><button onClick={handleGeneratePitch} className="btn btn-primary me-2" disabled={isLoading}>{isLoading ? 'Generating...' : 'Generate Pitch'}</button></div>
        </div>

        {generatedPitch && (
          <div className="mt-4">
            <h5>Generated Pitch</h5>
            <p><strong>Name:</strong> {generatedPitch.name}</p>
            <p><strong>Tagline:</strong> {generatedPitch.tagline}</p>
            <p><strong>Pitch:</strong> {generatedPitch.pitch}</p>
            <button onClick={() => savePitch(generatedPitch)} className="btn btn-success">Save to Dashboard</button>
          </div>
        )}
      </section>

      <section id="dashboard">
        <h3>Saved Pitches / Dashboard</h3>
        <div className="row g-3 mt-2">
          {savedPitches.map(p => (
            <div key={p.id} className="col-md-6">
              <div className="card p-3 h-100">
                <h5>{p.name}</h5>
                <p className="small text-muted">{p.tagline}</p>
                <div className="mt-auto pt-2"><button onClick={() => editPitch(p.id)} className="btn btn-sm btn-outline-primary me-1">View/Edit</button><button onClick={() => deletePitch(p.id)} className="btn btn-sm btn-outline-danger">Delete</button></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// --- Baqi saare components (No changes needed here) ---
const Navbar = ({ user, profile, onLoginClick, onLogout }) => (
  <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
    <div className="container">
      <a className="navbar-brand brand" href="#">PitchCraft</a>
      {user ? (
        <div className="d-flex align-items-center gap-3">
          <div className="navbar-profile">
            <img src={profile?.photoURL || 'https://dummyimage.com/40x40/ced4da/6c757d.png&text=+'} alt="Profile" className="profile-pic" />
            <span>{profile?.displayName || user.email}</span>
          </div>
          <button onClick={onLogout} className="btn btn-outline-danger btn-sm">Logout</button>
        </div>
      ) : (
        <button onClick={onLoginClick} className="btn btn-primary btn-sm">Login / Signup</button>
      )}
    </div>
  </nav>
);

const AuthModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="modal show d-block">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{isLogin ? 'Login' : 'Sign Up'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <input className="form-control mb-2" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <input className="form-control mb-3" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            <button className="btn btn-primary w-100" onClick={handleAuth}>{isLogin ? 'Login' : 'Sign Up'}</button>
          </div>
          <div className="modal-footer justify-content-center">
            <p className="mb-0 small" style={{ cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Need an account? Sign Up" : "Have an account? Login"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroSection = () => (
  <header className="hero">
    <div className="container">
      <h1>AI that writes your startup pitch</h1>
      <p className="lead text-muted">Turn your idea into a professional pitch in minutes.</p>
    </div>
  </header>
);

const Footer = () => (
  <footer className="container border-top pt-4 pb-5 mt-5 text-muted small">
    <p>PitchCraft — Final Demo</p>
  </footer>
);

export default App;