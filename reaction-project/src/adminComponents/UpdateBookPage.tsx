import { ChangeEvent, useState } from "react"
import { apiBase } from "../lib/api"
import { useForm, SubmitHandler} from "react-hook-form"
import { useNavigate, useParams } from "react-router";

interface Book {
    title?: string
    author?: string
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
    id: number
    added_date?: Date
    borrowed_date?: Date | undefined 
    returned_date?: Date | undefined 
    is_borrowed?: boolean 
}

export default function UpdateBookPage(){
    const [errorMsg, setErrorMsg] = useState("");
    const [file, setFile] = useState<File | null>(null)
    const [fileName, setFileName] = useState("")
    const [pdfFile, setPDFFile] = useState<File | null>(null)
    const [pdfFileName, setPDFFilename] = useState("")
    const [ID, setID] = useState("")
    const navigate = useNavigate();
    const param = useParams();

    const {register, formState: { errors }, handleSubmit} = useForm<Book>({ 
        defaultValues: {
            id: param.bookId ? Number(param.bookId) : 0,
        },
        mode: "onSubmit",
    });

    const handleChangePDF = (e : ChangeEvent<HTMLInputElement>) => {
        if (e.target.files){
            setPDFFile(e.target.files[0])
            setPDFFilename(e.target.files[0].name)
        }
    }
    const handleChangeImg = (e : ChangeEvent<HTMLInputElement>) => {
        if (e.target.files){
            setFile(e.target.files[0])
            setFileName(e.target.files[0].name)
        }
    }
    ///'Content-Type': 'multipart/form-data' is like 'application/json' except it can also handle other stuffs like image, binary data, file, and others stuffs
    const handleSubmitImg = async () => {
        if (!file) {
            return
        }

        try{
            ///'multipart/form-data' is like 'application/json' except it can also handle other stuffs like image, binary data, file, and others stuffs
            const formData = new FormData();
            formData.append('cover_img', file);

            await apiBase.request({
                method: 'patch',
                url: `books/update/cover/${param.bookId}`,
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            navigate('/')

        } 
        catch (error:any){
            setErrorMsg(error.message);
            console.log(error);
        }
    }

    const handleSubmitPDF = async () => {
        if (!pdfFile){
            return
        }

        try{
            ///'multipart/form-data' is like 'application/json' except it can also handle other stuffs like image, binary data, file, and others stuffs
            const formData = new FormData();
            formData.append('pdf_file', pdfFile);
            const response = await apiBase.request({
                method: 'post',
                url: `books/upload/bookpdf/${param.bookId ? param.bookId : ID}`,
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            
            if (response.status === 200) {
                navigate('/');
            }
        } 
        catch (error:any){
            setErrorMsg(error.message);
            console.log(error);
        }
        

    }

    const handleDeleteBook = async ()  => {
        try{
            const response = await apiBase.request({
                method: 'delete',
                url: `books/delete/${param.bookId}`
            })
            console.log(response)

        } catch (error:any){
            setErrorMsg(error.message);
            console.log(error);
        }

        navigate('/')
    }

    const onSubmit: SubmitHandler<Book> = async (data) => {
        ///Object.entries() converts Object into Array, 
        //.filter() filter out fields with "" value. React Hook Form returns empty string "" if fields are not set by user, if not filtered out the field will be updated to just "" in the database
        // If the variable is intentionally unused, prefix it with an underscore (_) to prevent it from being flagged as ( 'field' is declared but its value is never read.) error.
        const filteredData = Object.entries(data).filter(([_, value]) => value !== "")
        ///Object.fromEntries() converts Array filtered data [] back to Object {}
        const filteredObjectData = Object.fromEntries(filteredData)
        console.log('submitted')
        try{
            await apiBase.request({
                method: 'patch',
                url: `books/update/${data.id}`,
                data: filteredObjectData,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            console.log(data)

            navigate('/')
        } catch (error:any) {
            setErrorMsg(error.message);
            console.log(error);
        }
    }

    return(

        <section>
              
            <section className="mt-5 ml-5 w-1/2">
                <form 
                id="update-book-form"
                className="text-gray-400"
                onSubmit={handleSubmit(onSubmit)}>

                    <input 
                    {...register('id', {
                        required: "Target ID is required",
                        })}
                        type="text" 
                        placeholder="Book ID"
                    />
                    {errors.id && <p> {errors.id.message}</p> } 

                    <input 
                        {...register("title", { 
                            maxLength: 64 
                        })} 
                        placeholder="Title"
                    />
                    <input 
                        {...register("author", { 
                            maxLength: 64 
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
            <section className="ml-2 flex flex-col items-start"> 

                <button 
                type="submit"
                form="update-book-form"
                className="mt-2"
                >「UPDATE BOOK」</button>

                <section className="mt-56">
                    <input 
                    className=" hidden"
                    id="cov_image"
                    name="cover_image" 
                    type="file" 
                    accept="image/jpeg"
                    onChange={handleChangeImg}/>
                    
                    {fileName && 
                    <p className="ml-2 mb-2 text-xs uppercase"
                    >{fileName}</p>}

                    <label 
                    className=" ml-2 p-1 border-2 cursor-pointer"
                    htmlFor="cov_image"
                    > SELECT FILE</label>

                    <button
                    className="mt-2"
                    onClick={handleSubmitImg}
                    >「UPDATE COVER IMG」</button>

                </section>

                <section
                className=" flex flex-col items-start align-left mt-32">

                    {pdfFile && 
                    <p className="ml-2 mb-2 text-xs uppercase"
                    >{pdfFileName}</p>}

                    <input
                    type="text"
                    className="ml-2 text-gray-400"
                    placeholder="Enter ISBN"
                    required={true}
                    value={param.bookId ? param.bookId : ID} 
                    onChange = {(e) => {
                        setID(e.target.value)
                    }}
                    />

                    <input 
                    className=" hidden"
                    id="book_pdf"
                    type="file"
                    accept=".pdf"
                    onChange={handleChangePDF}
                    />


                    <label
                    className=" ml-2 mt-2 p-1 border-2 cursor-pointer"
                    htmlFor="book_pdf"
                    > SELECT PDF FILE</label>

                    <button
                    className="mt-2"
                    onClick={handleSubmitPDF}
                    >「UPLOAD BOOK PDF」</button>


                </section>




                <button 
                className="mt-56"
                onClick={handleDeleteBook}
                > 「DELETE BOOK」</button>
                

                
                
            </section>       
            {errorMsg && <p>{errorMsg}</p>}
        </section>
    );
}