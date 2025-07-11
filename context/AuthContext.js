'use client'
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore'
import React, {useContext, useState, useEffect} from "react";

const AuthContext = React.createContext()

export function useAuth(){
    return useContext(AuthContext);
}

export function AuthPorvider({ children }){
    const [currentUser, setCurrentUser] = useState(null);
    const [userDataObj, setUserDataObj] = useState(null);
    const [loading, setLoading] = useState(true);

    //Auth handlers
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }
    function loginDemo(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }
    function logout() {
        setUserDataObj(null);
        setCurrentUser(null);
        return signOut(auth);
    }

    useEffect(() =>{
        const unSubscribe = onAuthStateChanged(auth, async user => {
            try{
                //set user to our local context state
                setLoading(true);
                setCurrentUser(user)
                if(!user){
                    console.log("No User found")
                    return
                }

                //if user exists fetch data from firesotre database
                console.log("Fetching User Data")
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                let firebaseData = {}
                if(docSnap.exists()){
                    console.log('Found User Data');
                    firebaseData = docSnap.data();
                    console.log(firebaseData);
                }
                setUserDataObj(firebaseData);
            } catch(err){
                console.log(err.message)
            } finally {
                setLoading(false);
            }
        });
        return unSubscribe;
        
    }, []);

    const value = {
        currentUser,
        userDataObj,
        setUserDataObj,
        signup,
        login,
        loginDemo,
        logout,
        loading
    }

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}