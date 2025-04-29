import { useState, useContext} from "react";
import { apiBase} from '../lib/api'
import { useLocation, useNavigate } from "react-router";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage(){
    const REQUEST_LOGIN_URL = import.meta.env.VITE_REACT_APP_REQUEST_LOGIN_ENDPOINT

    if (!REQUEST_LOGIN_URL){
        throw new Error("REACT_APP_REQUEST_LOGIN_ENDPOINT is not defined");
    }

    const [currentEmail, setEmail] = useState("");
    const [currentPassword, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [formValMsg, setFormValMsg] = useState("");
    const authContext = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    
    const handleCloseDisplayLogin = () => {
        navigate("/");
    }
    const handleCreateAcc = () => {
        navigate("/create/user");
    }

    // when <button type="button" it usually reload the page immediately, 
    // so some functions in handle submit functions might not work 
    // because it couldn't execute properly because of the page reloads
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation logic
        if (!currentEmail || !currentPassword) {
            setFormValMsg("email and password are required.");
            return; // Stop the login process
        }

        //Send data in the application/x-www-form-urlencoded format, 
        //cuz backend auth requires this content type.
        const auth_data = new URLSearchParams();
        auth_data.append('username', currentEmail);
        auth_data.append('password', currentPassword);

        try{
            console.log(auth_data)
            console.log("a")
            const response = await apiBase.request({
                method: 'post',
                url: REQUEST_LOGIN_URL,
                data: auth_data,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
            console.log(auth_data)
            console.log(response)
            console.log("b")
            localStorage.setItem('access_token', response.data.access_token);
            console.log("c")
            localStorage.setItem('refresh_token', response.data.refresh_token);
            console.log("d")
            authContext.setIsAuthenticated(true);
            console.log("e")

        } catch (error: any) {
            setErrorMsg(error.response.data.detail);
            console.log(error.response.data.detail)
            console.log(error.response);
        }
        
        if (location.state?.from){
            navigate(location.state.from);
        }else{
            navigate('/');
        }     
    }

    return(
        <section className="flex justify-center items-center w-screen h-screen color fixed z-10 bg-black/80">
            <section className="static aspect-square border-2 w-min "> 

                <form onSubmit={handleSubmit} noValidate >

                    <button
                    className=" w-full hover:bg-red-800 hover:text-red-800 transition duration-500 rounded-sm"
                    type="button"
                    onClick={handleCloseDisplayLogin}
                    >x</button>

                    <input 
                    className="mt-10 ml-5 rounded-sm text-black hover:text-slate-300 bg-transparent text-white"
                    id="email"
                    type="email" 
                    placeholder="EMAIL" 
                    value={currentEmail}
                    onChange={(e) => {
                        setEmail(e.target.value)
                        setErrorMsg("")
                        setFormValMsg("")
                    }} />

                    <input 
                    className="mt-5 ml-5 rounded-sm text-black bg-transparent text-white"
                    id="password"
                    type="password" 
                    placeholder="PASSWORD"
                    value={currentPassword}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        setErrorMsg("")
                        setFormValMsg("")
                    }} />

                    {formValMsg && <p
                    className="ml-5 text-red-800 text-xs uppercase">{formValMsg}</p>}

                    {errorMsg && <p
                    className="ml-5 text-red-800 text-xs uppercase">{errorMsg}</p>} 
                      
                    <button className="ml-5 mt-16 text-white hover:text-gray-200" type="submit">LOG IN</button>
                </form>

                <button className="ml-5 text-white hover:text-gray-200" type="button" onClick={handleCreateAcc}>CREATE NEW ACCOUNT </button>
                
            </section>
            
            


            


        </section>
    );

};