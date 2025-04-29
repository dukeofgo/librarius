import { useState } from "react";
import { apiBase } from "../lib/api";

export default function UpdateUserPage(){
    const [errorMsg, setErrorMsg] = useState("");
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState<number>();
    const [password, setPassword] = useState('');
    
// when <button type="button" it usually reload the page immediately, 
// so some functions in handle submit functions might not work 
// because it couldn't execute properly because of the page reloads
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try{
            const response = await apiBase.request({
                method: 'patch',
                url: `users/update/${email}`,
                data: {
                    email: email,
                    name: name,
                    age: age,
                    password: password,
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            
            })
            console.log(response.data)

        } catch (error: any){
            setErrorMsg(error.message)
            console.log(error)
        }
    }    
    
    return(
        <section>
            {errorMsg && <p>{errorMsg}</p>}   

            <form onSubmit={handleSubmit}>

                    <input                
                    id="email"
                    type="text"
                    placeholder="Email"
                    value={email}
                    required
                    onChange={(e) => 
                        setEmail(e.target.value)}/>

                    <input                
                    id="name"
                    type="text"
                    maxLength={64}
                    placeholder="Name"
                    value={name}
                    onChange={(e) => 
                        setName(e.target.value)}/>

                    <input                
                    id="email"
                    type="text"
                    placeholder="Age"
                    value={age}
                    onChange={(e) => 
                        setAge(Number(e.target.value))}/>


                    <input                
                    id="password"
                    type="text"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => 
                        setPassword(e.target.value)}/>      

                <button type="submit">Update</button>              
            </form>
        </section>
    );
}

