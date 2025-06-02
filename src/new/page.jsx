import { useState } from "react";


export const Page = () => {
    const [postId, setPostId] = useState("");
    const [type, setType] = useState("movie"); 
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    

    const fetchData = async () => {
        setError("");
        setData(null);
        setIsLoading(true);
        
        if (!postId) {
            setError("Please enter a valid post Id.");
            return;
        }

       
        const API_KEY = "DEMOTEMPAPI";
        const baseURL =
            type === "movie"
                ? "https://links.modpro.blog/wp-json/wp/clenc/files"
                : "https://episodes.modpro.blog/wp-json/wp/clenc/files";

        


        try {
            const url = `${baseURL}?api_key=${API_KEY}&id=${postId}`;
            const res = await fetch(url);
            const result = await res.json();

            if (!result||!result.Title ) {
                setError("Sorry! Cannot find what you're looking for.");
            } else {
                setData(result);
            }
        } catch (err){
            setError("Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-amber-300 min-h-screen">
            <h1 className=" flex justify-center items-center text-3xl  " >🎬 Search Movies or Series</h1>

            <div>
                <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg">
                    <option value="movie">Movie</option>
                    <option value="series">Series</option>
                </select>
                <input
                    className="px-3 py-2"
                    type="text"
                    placeholder="Enter post ID..."
                    value={postId}
                    onChange={(e) => setPostId(e.target.value)}
                />
                <button className="mt=3" onClick={fetchData} disabled={isLoading}>{isLoading ? "Searching..." : "Search" }</button>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {isLoading && <p className="">Loading...</p>}

            {data && (
                <div className="">
                    <h2>{data.Title} ({data.Year})</h2> 
                    <p><strong>Post ID:</strong>{postId}</p>


                    {data.links?.length>0? (

                        <div className="">
                            <p>🔗 Streaming Links:</p>
                            {data.links.map((link, index) => (
                            
                                <a key={index} href={link.url||"#"} target="_blank" rel="noopener noreferrer">
                                    {link.name || `Server ${index + 1}`}
                                </a>
                            
                            ))}
                        </div>
                    ) : (
                            <p>No links available.</p>
                    
                   ) }  
                </div>
            )}
        </div>
    );
};
