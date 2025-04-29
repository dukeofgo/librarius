import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiBase } from "../lib/api";

interface Book {
    id?: number
    title: string
    author: string
    edition?: string | undefined 
    publisher?: string
    publish_date?: string | undefined  
    publish_place?: string | undefined
    number_of_pages?: number | undefined 
    language?: string | undefined 
    isbn?: string
    subtitle?: string | undefined 
    added_date: Date
    borrowed_date?: Date | undefined 
    user_id?: number | undefined
    is_borrowed?: boolean 
}

export default function BookRepositoryPage(){
    const [errorMsg, setErrorMsg] = useState("");
    const [books, setBooks] = useState<Book[]>([]);
    
    useEffect(() => {
        const requestData = async () => {
            try{
                const response = await apiBase.request({
                    method: 'get',
                    url: 'books/retrieve/books',
                    params: {
                        limit: 50,
                        skip: 0,
                    },
                    headers: { 
                        'Content-Type': 'application/json', 
                    }
                })
                console.log("test")
                setBooks(response.data)
            }
            catch (error: any){
                setErrorMsg(error.message);
                console.log(error);
            }
        }

        requestData();

    }, []);

    return(

        <section>

            <table className="mt-10 flex justify-center text-xs">
                <tbody>
                    <tr>

                        <th>ID</th>
                        <th>TITLE</th>
                        <th>AUTHOR</th>
                        <th>ISBN</th>
                        <th>PUBLISHER</th>
                        <th>PUBLISH DATE</th>
                        <th>NUMBER OF PAGES</th>
                        <th>ADDED DATE</th>
                        <th>LANGUAGE</th>
                        <th>USER ID</th>
                        <th>IS BORROWED</th>
                        <th>BORROW DATE</th>
                    </tr>
                    {books.map((book) =>(
                        <tr 
                        className="border-2"
                        key={book.id}>
                            <td className="px-5 py-2">{book.id}</td>
                            <td className="px-0 py-2">{book.title}</td>
                            <td className="px-5 py-2">{book.author}</td>
                            <td className="px-5 py-2">{book.isbn}</td>
                            <td className="px-5 py-2">{book.publisher}</td>
                            <td className="px-5 py-2">{book.publish_date}</td>
                            <td className="px-5 py-2">{book.number_of_pages}</td>
                            <td className="px-5 py-2">{String(book.added_date)}</td>
                            <td className="px-5 py-2">{book.language}</td>
                            <td className="px-5 py-2">{book.user_id}</td>
                            <td className="px-5 py-2">{String(book.is_borrowed)}</td>
                            <td className="px-5 py-2">{String(book.borrowed_date)}</td>
                            <td className="px-5 py-2"> <Link to={`/update/book/${book.id}`}>+</Link> </td>
                        </tr>
                    ))}
                </tbody>
            </table>


















            {errorMsg && <p>{errorMsg}</p>}
        </section>




    );
}