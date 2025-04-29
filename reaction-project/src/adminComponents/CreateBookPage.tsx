import { useState } from "react"
import { apiBase } from "../lib/api"
import { useForm, SubmitHandler} from "react-hook-form"
import { useNavigate } from "react-router"

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

export default function CreateBookPage (){
    const [errorMsg, setErrorMsg] = useState("");
    const {register, handleSubmit} = useForm<Book>();
    const [ISBN, setISBN] = useState("");
    const navigate = useNavigate();

    const onSubmit:SubmitHandler<Book>  = async (data) => {
   
        try{
            const response = await apiBase.request({
                method: 'post',
                url: 'books/create',
                data: data,
                headers: {
                   'Content-Type': 'application/json'
                }
            }) 
            console.log(response.data)
        } catch (error: any) {
            setErrorMsg(error.message);
            console.log(error);
        }
    }

    const handleCreateISBN = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try{
            const response = await apiBase.request({
                method: 'post',
                url: `books/create/${ISBN}`,
                headers: {
                   'Content-Type': 'application/json'
                }
            }) 
            console.log(response.data)
            navigate('/')
        } catch (error: any) {
            setErrorMsg(error.message);
            console.log(error);
        }
        
        
    }

    return(
        <section>
            {errorMsg && <p>{errorMsg}</p>}   
            <section className="mt-5 ml-5 w-1/2" >  
                <form 
                className="text-gray-400"
                onSubmit={handleSubmit(onSubmit)}
                >
                    <input {...register("title", { required: true})} placeholder="Title"/>

                    <input {...register("author", { required: true})} placeholder="Author"/>

                    <input 
                        {...register("title", { 
                            required: true,
                        })} 
                        placeholder="Title"
                    />
                    <input 
                        {...register("author", { 
                            required: true,
                        })} 
                        placeholder="Author"
                    />
                    <input 
                        {...register("edition", {
                            maxLength: 64 
                            })} 
                        placeholder="Edition"
                    />
                    <input 
                        {...register("publisher", {
                            maxLength: 64 
                            })} 
                        placeholder="Publisher"
                    />
                    <input 
                        {...register("publishDate", { 
                            maxLength: 64 
                        })} 
                        placeholder="Publish Date"
                    />
                    <input 
                        {...register("publishPlace", { 
                            maxLength: 64 
                        })} 
                        placeholder="Publish Place"
                    />
                    <input 
                        {...register("numPages")} 
                        placeholder="Number of Pages"
                    />
                    <input 
                        {...register("description", { 
                            maxLength: 1024 
                        })} 
                        placeholder="Description"
                    />
                    <input 
                        {...register("language", { 
                            maxLength: 32 
                        })} 
                        placeholder="Language"
                    />
                    <input 
                        {...register("isbn", { 
                            maxLength: 13 
                        })} 
                        placeholder="ISBN"
                    />
                    <input 
                        {...register("lccn", { 
                            maxLength: 12 }
                        )} 
                        placeholder="LCCN"
                    />
                    <input 
                        {...register("subtitle", { 
                            maxLength: 1024 
                        })} 
                        placeholder="Subtitle"
                    />
                    <input 
                        {...register("subjects", { 
                            maxLength: 256 
                        })} 
                        placeholder="Subjects"
                    />

                    
                </form>
            </section>
            
            <button 
            className="ml-3 mt-2"
            type="submit"
            >「CREATE」</button>

            <form 
            className="mt-10 ml-3"
            onSubmit={handleCreateISBN}
            >
                <input 
                className="ml-2 text-gray-400"
                type="text"
                placeholder="ISBN"
                value={ISBN}
                onChange={(e) => {
                    setISBN(e.target.value)
                }}
                />
                
                <button 
                className="mt-2 block"
                type="submit"
                >「CREATE WITH ISBN」</button>
            </form>

        </section>
        



    );
}