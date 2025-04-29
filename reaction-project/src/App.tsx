import { useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { Routes, Route } from "react-router";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import DetailPage from "./components/DetailPage";
import PortableDocumentFileViewer from "./components/PortableDocumentFileViewer";
import CreateBookPage from "./adminComponents/CreateBookPage";
import CreateUserPage from "./components/CreateUserPage";
import UpdateBookPage from "./adminComponents/UpdateBookPage";
import UpdateUserPage from "./components/UpdateUserPage";
import BookRepositoryPage from "./adminComponents/BookRepositoryPage";

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userScope, setUserScope] = useState('');

    return (
        <section>
            <AuthContext.Provider value={{isAuthenticated, setIsAuthenticated, userScope, setUserScope}}>  
                <Routes>
                    <Route path="/" element={<HomePage/>}> 
                        <Route path="login" element={<LoginPage/>}/>
                        <Route path="create/user" element={<CreateUserPage/>}/>
                    </Route>

                    <Route path="create/book" element={<CreateBookPage/>}/>

                    <Route path="details/:bookId" element={<DetailPage/>}>
                        <Route index element={<PortableDocumentFileViewer/>}/>
                    </Route>
                        
                    <Route path="update">
                        <Route path="book" element={<UpdateBookPage/>}/>
                        <Route path="book/:bookId" element={<UpdateBookPage/>}/>
                        <Route path="user/:userId" element={<UpdateUserPage/>}/>
                    </Route>   

                    <Route path="repository/books" element={<BookRepositoryPage/>}/>

                </Routes>
            </AuthContext.Provider>
        </section>
    );
}




