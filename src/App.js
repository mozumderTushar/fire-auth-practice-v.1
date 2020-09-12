import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig)

function App() {

  const [newUser, setNewUser] = useState(false)
  const [user, setUser] = useState({
    isSignedIn: false,
    newUser:false,
    name:'',
    email: '',
    password:'',
    photo: '',
   
  })

  const provider = new firebase.auth.GoogleAuthProvider();
  var fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSingIn = () =>{
    firebase.auth().signInWithPopup(provider)
    .then(res => {
      const {displayName, email, photoURL} = res.user;
      const singInUser = {
        isSignedIn:true,
        name:displayName,
        email:email,
        photo:photoURL
      }
      setUser(singInUser)
      console.log(displayName,email,photoURL);
    })
    .catch(err => {
      console.log(err);
      console.log(err.message);
    })
  }

  const handleFbLogIn = () => {
    firebase.auth().signInWithPopup(fbProvider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

  const handleSignOut = () => {
    firebase.auth().signOut()
    .then( res => {
      const signOutUser = {
        isSignedIn:false,
        name:'',
        photo:'',
        email:'',
        error:'',
        success:false
      }
      setUser(signOutUser)
    })
  .catch(err => {

  }) 
  }

 
  const handleBlur = (e) => {
    let isFieldValid = true;
    if(e.target.name === 'email'){
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if(e.target.name === 'password'){
      const isPasswordValid = e.target.value.length >= 6;
      //12345678@aA
      const isPasswordHasNumber = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])/.test(e.target.value)
      isFieldValid = isPasswordValid && isPasswordHasNumber;
    }
    if(isFieldValid){
      const newUserInfo = {...user};
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo)
    }
  }
  const handleSubmit = (e) => {
    // console.log(user.email, user.password);
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then( res => {
        const newUserInfo = {...user};
        newUserInfo.error='';
        newUserInfo.success = true;
        setUser(newUserInfo);
        updateProfile(user.name)
        // console.log(res);
      })
      .catch(error => {
        // Handle Errors here.
       const newUserInfo = {...user};
       newUserInfo.error = error.message;
       newUserInfo.success = false;
       setUser(newUserInfo)
      });
    }
    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then( res => {
        const newUserInfo = {...user};
        newUserInfo.error='';
        newUserInfo.success = true;
        setUser(newUserInfo);
        console.log("sign in user info", res.user);
      })
      .catch(error => {
        // Handle Errors here.
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo)
        // ...
      });
    }
    e.preventDefault();
  }

  const updateProfile = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function() {
     console.log("user name updated successfully");
    }).catch(function(error) {
      console.log(error);
    });
  }
  return (
    <div className="App">
     {
       user.isSignedIn ?  <button onClick={handleSignOut}>Sign out</button> :
         <button onClick={handleSingIn}>Sign in</button>
     }
     <br/>
     <button onClick={handleFbLogIn}>Sign in using facebook</button>
      {
        user.isSignedIn && <div>
        <p>Welcome, {user.name}</p>
        <p>Your email:{user.email}</p>
        <img src={user.photo} alt=""/>
        </div>
      }

      <h1>Our own Authentication</h1>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id=""/>
      <label htmlFor="newUser">New User Sign Up</label>
      <form onSubmit={handleSubmit}>
        {newUser && <input type="text" name="name" onBlur={handleBlur} placeholder="Your name"/>}
        <br/> <br/>
        <input type="text" name="email" onBlur={handleBlur} placeholder="Enter your email address" required/>
        <br/> <br/>
        <input type="password" onBlur={handleBlur} name="password" placeholder="Enter your password" required/>
        <br/>
        <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'}/>
      </form>
       <p style={{color:'red'}}>{user.error}</p>
       {user.success &&   <p style={{color:'green'}}>user { newUser ? 'created' : 'Logged In'} successfully</p>}
    </div>
  );
}

export default App;
