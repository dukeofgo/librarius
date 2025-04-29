import { useContext, useEffect, useState} from "react";
import { apiBase} from '../lib/api'
import { useNavigate, useSearchParams, Link, Outlet } from "react-router";
import { AuthContext } from "../context/AuthContext";

interface Book {
    title: string
    author: string
    edition?: string | undefined 
    publisher?: string
    publishDate?: string | undefined  
    publishPlace?: string | undefined
    numPages?: number | undefined 
    description?: string | undefined
    language?: string | undefined 
    isbn?: string
    lccn?: string | undefined 
    subtitle?: string | undefined 
    subjects?: string | undefined 
    cover_image?: string 
    id?: number
    added_date?: Date
    borrowed_date?: Date | undefined 
    returned_date?: Date | undefined 
    is_borrowed?: boolean 
}

export default function HomePage(){
    const [userEmail, setUserEmail] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [books, setBooks] = useState<Book[]>([]);
    const authContext = useContext(AuthContext);
    const [pagQueryParams, setPagQueryParams] = useSearchParams({page: "0", limit: "10", skip: "0"});
    const navigate = useNavigate();
    const [staticComingSoonFile, setStaticComingSoonFile] = useState('');
    const handleDisplayLogin = () => {
        navigate("/login")
    };

    const handleLogOut = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        authContext.setIsAuthenticated(false)
        authContext.setUserScope('')
    };

    const handleBackwardPagination = async () => {

        const skipValue = Number(pagQueryParams.get('skip')) - 10
        const currentPage = Number(pagQueryParams.get('page')) - 1

        setPagQueryParams({
            page: String(currentPage),
            limit: '10', 
            skip: String(skipValue),
        }, {replace: true})

        try{
            const response = await apiBase.request({
                method: 'get',
                url: 'books/retrieve/books',
                params : {
                    limit: 10,
                    skip: skipValue,
                },
                headers: { 
                    'Content-Type': 'application/json', 
                }
            })      
            
            console.log(response.data)
            setBooks(response.data)

        }catch (error: any) {
            setErrorMsg(error.message);
            console.log(error);
        }

    }

    const handleForwardPagination = async () => {
        
        const skipValue = Number(pagQueryParams.get('skip')) + 10
        const currentPage = Number(pagQueryParams.get('page')) + 1
        
        setPagQueryParams({
            page: String(currentPage),
            limit: '10', 
            skip: String(skipValue),
        }, {replace: true})

        
        try{
            const response = await apiBase.request({
                method: 'get',
                url: 'books/retrieve/books',
                params : {
                    limit: 10,
                    skip: skipValue,
                },
                headers: { 
                    'Content-Type': 'application/json', 
                }
            })         
            console.log(response.data)
            setBooks(response.data)

        if (response.data.length == 0){
            setErrorMsg("No more books to show")
        }

        }catch (error: any) {
            setErrorMsg(error.message);
            console.log(error);
        }

    }


    useEffect(() => {
        ///make it so that checking local storage to authenticate is not needed
        if (localStorage.getItem('access_token')){
            authContext.setIsAuthenticated(true)
        }
        
        if (authContext.isAuthenticated) {
            const requestData = async () => {
                try {
                    const response = await apiBase.request({
                        method: 'get',
                        url: `users/metadata`,
                        headers: { 
                            'Content-Type': 'application/json', 
                        }
                    });
                    authContext.setUserScope(response.data.scope);
                    setUserEmail(response.data.email);
                } 
                catch (error:any) {
                    setErrorMsg(error.message);
                    console.log(error);
                }
            };
            requestData();
        }
    }, [authContext.isAuthenticated]); 

    useEffect(() => {
        const requestData = async() => {
            try {
                const response = await apiBase.request({
                    method: 'get',
                    url: 'books/retrieve/books',
                    params : {
                        limit: pagQueryParams.get('limit'),
                        skip: pagQueryParams.get('skip'),
                    },
                    headers: { 
                        'Content-Type': 'application/json', 
                    }
                })   
                setBooks(response.data)
                
            } 
            catch (error:any) {
                setErrorMsg(error.message);
                console.log(error);
            }
        }   

        requestData();
        
    }, [authContext.isAuthenticated, pagQueryParams])
    
    useEffect(() => {
        const staticUrl = async () => {
            try {
                const response = await apiBase.request({
                    method: 'get',
                    url: 'books/retrieve/staticfile/cover-coming-soon.jpg',
                    headers: { 
                        'Content-Type': 'application/json', 
                    }
                })

                setStaticComingSoonFile(response.data.url)
                console.log(response.data)
                console.log(response.data.url)
            }
            catch (error:any) {
                setErrorMsg(error.message);
                console.log(error);
            }
        }
        staticUrl();
    }, [])


    const imgData = (b64Data:string):string => {
        return `data:image/jpeg;base64,${b64Data}`;
    }

    ///const toTitle = (str:string) => {
    ///    const wordsArray = str.split(' ');
    ///   const titledWordsMap = wordsArray.map((word) => word[0].toUpperCase() + word.substr(1).toLowerCase());
    ///    const strWords = titledWordsMap.join(" ")
    ///    return strWords;
    ///};

    return(
        <section>
            <section>
                <Outlet/>
            </section>
            

            {authContext.isAuthenticated ? (
                <section className="flex flex-col items-end">
                    <h1 className="mt-5 mr-5 uppercase"> {userEmail}</h1>
                    <button className="mt-2 mr-6" onClick={handleLogOut}>LOG OUT</button>
                </section>
            ) : (
                <button className="absolute top-0 right-0 mt-4 mr-6" onClick={handleDisplayLogin} disabled={authContext.isAuthenticated}>SIGN UP</button>
            )}

            
            {/* one && is LOGICAL AND, and other && is CONDITIONAL RENDERING  */}
            {authContext.isAuthenticated && authContext.userScope == 'superuser' && 
                <section className="flex flex-col items-end mt-5">

                    <Link 
                    to="/create/book"
                    className="mr-3"
                    >「CREATE BOOK」</Link>

                    <Link 
                    to="/update/book"
                    className="mt-2 mr-3"
                    >「UPDATE BOOK」</Link>

                    <Link 
                    to="/create/user"
                    className="mt-2 mr-3"
                    >「ADD NEW USER」</Link>

                    <Link 
                    to="/repository/books"
                    className="mt-2 mr-3"
                    >「BOOK REPOSITORY」</Link>

                </section>
            }

            <table className="flex mt-96 justify-center border-white min-w-min min-h-min ">
                <tbody >
                    {books.map((book) => 
                        <tr 
                        key={book.id}
                        className="border-2 border-white min-h-min"
                        >
                            <td className="h-48 min-h-min w-36 border-r-2 ">    
                                {/* We use <Link> instead of <a> because <Link> redirect without reloading page, and <a> does, if the page is reloaded the useState info will be cleared, so we want to avoid that */}
                                <Link 
                                to={authContext.isAuthenticated ? `details/${book.id}`: '/login'} 
                                state={{from: `/details/${book.id}`}}
                                className="w-36"
                                ><img 
                                    src={book.cover_image ? imgData(book.cover_image) : staticComingSoonFile} 
                                    style={{ width: '100px', height: '150px' }}
                                    className="mx-auto"
                                    />
                                    
                                </Link>
                            </td>
                            
                            <td className="relative flex flex-col h-48 min-h-min">
                                <Link 
                                to={authContext.isAuthenticated ? `details/${book.id}`: '/login'} 
                                className="w-4/5 mt-5 mx-5 text-xl " 
                                state={{from: `/details/${book.id}`}}
                                >{book.title.toUpperCase()}
                                </Link>

                                <p
                                className="mt-5 px-5 text-xs"
                                >{book.author.toUpperCase()}</p>
                                
                                {authContext.userScope == 'superuser' && 
                                <Link 
                                to={`update/book/${book.id}`} 
                                className="flex flex-col absolute mt-5 mx-5 text-xl hover:text-gray-200 right-2  "
                                >+ 
                                </Link>
                                }
                
                            </td>

                        </tr>
                    )}
                    
                </tbody>
            </table>


            
            <section className="flex justify-center my-16 gap-4">

                <button 
                type="button"
                disabled={pagQueryParams.get("page") == '0'}
                onClick={() => {
                    handleBackwardPagination()
                    setErrorMsg('')
                }}
                >{'<'}</button>
                
                <p> {pagQueryParams.get("page")} </p>

                <button 
                type="button"
                disabled={books.length == 0}
                onClick={() =>{
                    handleForwardPagination()
                }}
                >{'>'}</button>

            </section> 

            {errorMsg && <p>{errorMsg}</p>}
            
        </section>
    )
}
