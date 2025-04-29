import { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf'; //https://github.com/wojtekmaj/react-pdf
import '../worker'
import { PDFDocumentProxy } from 'pdfjs-dist';
import { apiBase } from '../lib/api';
import { useOutletContext } from 'react-router';

export default function PortableDocumentFileViewer(){
    const [totalNumPages, setTotalNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [nextPage, setNextPage] = useState(2);
    const [errorMsg, setErrorMsg] = useState("");
    const [fileURL, setFileURL] = useState('');
    const isbnData = useOutletContext();

    useEffect(() => {
        const requestData = async() => {
            try {
                const response = await apiBase.request({
                    method: 'get',
                    url: `books/retrieve/bookpdf/${isbnData}`,
                    headers: { 
                        'Content-Type': 'application/json', 
                    }
                })
                setFileURL(response.data.url)
            }
            catch (error: any) {
                setErrorMsg(error.message);
                console.log(error);
            }
        }
        requestData();
    }, [])
    /// onLoadSuccess, when successfully loaded, call on onDocumentLoadSuccess function with 'data' object as argument 
    /// 'data' contains attribute '.numPages' which tell the total number of pages of the pdf
    const onDocumentLoadSuccess = (data: PDFDocumentProxy) => {
        setTotalNumPages(data.numPages)    
    }
    const moveNextPage = () => {
        setCurrentPage((currentPage) => currentPage += 1)
        setNextPage((nextPage) => nextPage += 1)
    }
    const movePrevPage = () => {
        setCurrentPage((currentPage) => currentPage -= 1)
        setNextPage((nextPage) => nextPage -= 1)
    }

    return(
        <section>
            <Document 
            className={'relative flex justify-center mt-24'}
            file={fileURL}
            noData={"PDF is not available"}
            /// onLoadSuccess, when successfully loaded, call on onDocumentLoadSuccess function with 'data' object as argument 
            onLoadSuccess={onDocumentLoadSuccess}
            >
                <Page
                width={750}
                pageNumber={currentPage}
                renderTextLayer={false} 
                renderAnnotationLayer={false}
                />

                <Page 
                width={750}
                pageNumber={nextPage}
                renderTextLayer={false} 
                renderAnnotationLayer={false}
                />

                <button
                    className='absolute top-0 left-0 h-full w-1/2'
                    type='button'
                    disabled={currentPage <= 1}
                    onClick={movePrevPage}
                    >{'<'}
                </button>

                <button
                    className='absolute top-0 right-0 h-full w-1/2'
                    type='button'
                    disabled={currentPage >= totalNumPages}
                    onClick={moveNextPage}
                    >{'>'}
                </button>

            </Document> 
        
            <section>

                <input
                className='bg-inherit text-5xl ml-5'
                type='number'
                min='0'
                max={totalNumPages}
                value={currentPage}
                
                onChange={(e) => {
                    //Number() convert string to number
                    setCurrentPage(Number(e.target.value))
                    setNextPage(Number(e.target.value) + 1)
                }} />


            </section>

            {errorMsg && <p>{errorMsg}</p>}

        </section>

    );
} 
