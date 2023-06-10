import './App.css';
import EntreatiesPage from "./pages/EntreatiesPage";
import EntreatyCoverMangementPage from './pages/EntreatyCoverManagementPage';
import SpecificEntreatyPage from './pages/SpecificEntreatyPage';
import { EntreatyJoinPage } from './pages/EntreatyJoinPage';
import ProfilePage from "./pages/ProfilePage.js";
import ExternalProfilePage from './pages/ExternalProfilePage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from "./pages/LandingPage.js";
import AvatarManagementPage from "./pages/AvatarManagementPage.js";
import ModifyIntroductionPage from './pages/ModifyIntroductionPage';
import CreatePostPage from "./pages/CreatePostPage.js"
import RegisterPage from "./pages/RegisterPage.js";

import {useState} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ProfileSearchPage from './pages/ProfileSearchPage';
import PostPage from './pages/PostPage';
import { AppContext } from './context';

import TagAdder from './components/TagAdder';
import InterestsPage from './pages/InterestsPage';
import { PersonalityAssessmentPage } from './pages/PersonalityAssessmentPage';



function App() {
    const [logged_in, set_logged_in] = useState(JSON.parse(sessionStorage.getItem("logged_in") || false));
    const change_logged_in_state = (action) => {
      switch(action){
        case "log_in":
          set_logged_in(true);
          sessionStorage.setItem("logged_in", true);
          /* window.addEventListener("beforeunload", (event) => {
            localStorage.removeItem("logged_in");
            event.preventDefault();
            event.returnValue = 200;
            }
          ) */
          return;
        case "log_out":
          set_logged_in(false);
          sessionStorage.removeItem("logged_in");
          return;
      }
    }
  return (
    <div className="App" id="App">
    <AppContext.Provider value={{logged_in, change_logged_in_state}}>
    <Routes>
      <Route exact path="/" element={<LandingPage/>} />

      <Route path="/Register" element={<RegisterPage/>} />


      <Route path="/Entreaties" element={<EntreatiesPage/>} />

      <Route path="/EntreatyCoverManagement/:entreaty_id" element={<EntreatyCoverMangementPage/>} />

      <Route path="/Entreaty/:entreaty_id" element={<SpecificEntreatyPage/>} />

      <Route path="/JoinEntreaty/:entreaty_id" element={<EntreatyJoinPage />}></Route>

      <Route path="/Profile" element={<ProfilePage/>} />

      <Route path="/Profile" element={<ProfilePage/>}/>

      <Route path="/Profile&Commands/:arguments" element={<ProfilePage/>} />

      <Route path="/Profile/:profile_name" element={<ExternalProfilePage/>}/>

      <Route path="/Profile/:profile_name&:arguments" element={<ExternalProfilePage/>}/>

      <Route path="/PersonalityAssessment/:profile_name" element={<PersonalityAssessmentPage/>}/>

      <Route path="/Profile/:profile_name/:post_id" element={<PostPage/>}/>

      <Route path="/Profile/:profile_name/:post_id/:subject_id" element={<PostPage/>}/>

      <Route path="/Profiles" element={<ProfileSearchPage/>} />

      <Route path="/Settings" element={<SettingsPage/>} />
      
      <Route path="/AvatarManagement" element={<AvatarManagementPage/>} />

      <Route path="/ModifyIntroduction" element={<ModifyIntroductionPage/>} />

      <Route path="/PostCreation" element={<CreatePostPage/>} />


      <Route path="/tagstest" element={<TagAdder tags={
        [["Art", "false"], ["Design", "false"], ["Gaming", "false"], ["Programming", "false"],
        ["Music", "false"], ["Writing", "false"], ["Roleplaying", "false"] ]}
        />} />
      
      <Route path="/Interests" element={<InterestsPage/>} />


    </Routes>
    </AppContext.Provider>
    </div>
  );
}

export default App;
