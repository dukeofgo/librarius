import { useEffect, useState} from "react";
import { useParams, Outlet, useNavigate} from "react-router";
import { apiBase} from '../lib/api'

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
export default function DetailPage(){
    const [book, setBook] = useState<Book>();
    const [displayPDF, setDisplayPDF] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();
    const param = useParams()

    const isbnData = book?.isbn

    const handleDisplayPDF = () => {
        setDisplayPDF(true)
    }

    const handleNavUpdate = () => {
        if (book){
            navigate(`/update/book/${param.bookId}`)
        }
        
    }

    useEffect(() => {
        const requestData = async() => {
            try {
                const response = await apiBase.request({
                    method: 'get',
                    url: `books/retrieve/${param.bookId}`,
                    headers: { 
                        'Content-Type': 'application/json', 
                    }
                })   
                console.log(response.data)
                setBook(response.data)
            } 
            catch (error:any) {
                setErrorMsg(error.message);
                console.log(error);
            }
        }
        
        requestData();
        

    }, []);

    return(     
        <section>
            <section className="w-2/5 mt-5 ml-5 pr-5 pb-5  border-r-2 border-b-2 uppercase ">
                {book ? 
                (
                    <section>
                        <h1 className="mb-2 text-4xl">{book.title}</h1>
                        <p className="mb-5 text-base">{book.author}</p>
                        <p className="text-justify">{book.description}</p>
                    </section>
                ) :
                (<p>Loading...</p>)
                }

            </section>

            <section>
                {displayPDF && <Outlet context={isbnData}/>}
                {!displayPDF && <button className={"mt-5 ml-5"} type="button" onClick={handleDisplayPDF}>「SEE PDF」</button>}
            </section>

            <button className={"mt-5 ml-5"} type="button" onClick={handleNavUpdate}>「UPDATE」</button>
            
            {errorMsg && <p>{errorMsg}</p>}
        </section>
    );
}
