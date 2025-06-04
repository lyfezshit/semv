import { useState } from "react";

export const Home = () => {
	const [postId, setPostId] = useState("");
	const [type, setType] = useState("movie");
	const [data, setData] = useState(null);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const fetchData = async () => {
		setError("");
		setData(null);
		setIsLoading(true);

		if (!postId.trim()) {
			setError("Please enter a valid Post ID.");
			setIsLoading(false);
			return;
		}

		const API_KEY = "DEMOTEMPAPI"; // Reminder: Store API keys securely, not hardcoded in production.
		const baseURL =
			type === "movie"
				? "https://links.modpro.blog/wp-json/wp/clenc/files"
				: "https://episodes.modpro.blog/wp-json/wp/clenc/files";

		try {
			const url = `${baseURL}?api_key=${API_KEY}&files=${postId.trim()}`;
			console.log("Request URL:", url); // Useful for debugging the exact URL being called.

			const res = await fetch(url);
			// It's good practice to check if the response was successful (e.g., res.ok)
			// However, this specific API returns HTTP 200 with `false` in the body for "not found".
			const result = await res.json();
			console.log("API Response:", result); // Log the raw API response to understand its structure.

			if (!result) {
				
				throw new Error("No data found for this Post ID.");
			}

			setData(result); // Set the result directly. Ensure `result` structure matches what the UI expects.
		} catch (err) {
			console.error("Fetch error:", err); // Log the error for server-side or detailed client-side debugging.
			// Log the full error object for more detailed debugging if needed.
			// The err.message (e.g., "No data found for this Post ID.") will be displayed to the user.
			console.log(err);
			setError(err.message || "Failed to fetch data. Please try again."); // Provide a user-friendly error message.
		} finally {
			setIsLoading(false); // Ensure loading state is reset whether the fetch succeeds or fails.
		}
	};
	const generateButtonsHTML = (fileIds, className) => {
		return `<!-- wp:buttons{"layout":{"type":"flex","justifyContent":"center","orientation":"vertical"}}-->\n <div class="wp-block-buttons">\n${fileIds
			.map(
				(id, index) => `<!--wp:buttons{"className":"${className}"}-->\n <div class="wp-block-button ${className}"><a class="wp-block-button__link wp-element-button" href=\"https://drive.google.com/uc?id=${id}&export=download\" target=\"_blank\" rel=\"noreferrer noopener nofollow\">Server ${index + 1}   </a></div>\n  <!--/wp:button-->`
			).join("\n")}\n</div>\n<!--/wp:buttons-->`;
	};

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
		alert("Code Copied to clipboard!")
	};

	return (

		<div className="min-h-screen bg-slate-900 text-gray-100 ">
		
			<nav className="w-full py-3  bg-slate-700 flex  items-center justify-between gap-6 mb-6">
				<h1 className=" px-2 py-2 font-mono text-xl ">SEMV</h1>
				<div className="flex items-center gap-4">
					<select
						value={type}
						onChange={(e) => setType(e.target.value)}
						className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
					>
						<option value="movie">Movie</option>
						<option value="series">Series</option>
					</select>

					<input
						className=" px-4 py-2 rounded-lg  bg-slate-700 border border-slate-600 text-gray-200 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
						type="text"
						placeholder="Enter post ID..."
						value={postId}
						onChange={(e) => setPostId(e.target.value)}
					/>

					<button
						className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-150"
						onClick={fetchData}
						disabled={isLoading}
					>
						{isLoading ? "Searching..." : "Search"}
					</button>
					</div>
				</nav>
		
		<div className=" p-4 sm:p-10 flex flex-col items-center">
			
			
			
				
		  
			

				<div className=" flex flex-col items-center max-w-lg p-6 sm:p-8 bg-slate-800 rounded-xl shadow-2xl">
					<h1 className="font-mono ">Find your movies</h1>
				

				{error && (
					<p className="text-red-300 p-3 mb-6 bg-red-700/30 border border-red-600 rounded-lg text-sm">
						{error}
					</p>
				)}
				{isLoading && !data && (
					<p className="text-emerald-400 py-4 text-center">
						Loading data, please wait...
					</p>
				)}

				

				{data && (
					<div className="mt-6 bg-slate-700/50 p-4 sm:p-6 rounded-lg shadow-md border border-slate-600">
						<h2 className="text-2xl font-bold text-emerald-400 mb-2">
							{data.title}
						</h2>
						{/* The API response for these endpoints does not include a 'year' attribute. */}

						<p className="font-medium text-slate-300 mb-4">
							<strong>Post ID:</strong> {postId}
						</p>

						{data.files && data.files?.length > 0 ? (
							<div >
								<p className="text-lg font-semibold text-emerald-300 mb-3">
									Google Drive Download Links:
								</p>
								<div className="grid grid-cols-1 gap-3">
									{/* The API returns an array of file IDs. We map over them to construct direct download links. */}
									{/* Each link is a button; an onClick handler could be added later for copying the link or other actions. */}
									{data.files.map((fileId, index) => (
										<button
											key={fileId}
											type="submit"
											className="block w-full px-4 py-3 bg-slate-600 hover:bg-emerald-600 text-slate-100 hover:text-white rounded-lg border border-slate-500 hover:border-emerald-500 transition-all duration-200 text-sm truncate"
										>
											https://drive.google.com/uc?id=${fileId}&export=download
										</button>
									))}
								</div>
							</div>
								
								
						) : (
							<p className="mt-4 font-medium text-slate-400">
								No downloadable files found for this entry.
							</p>
						)}
						</div>
						
						
				
					
				)}
				</div>
				<div className="grid grid-cols-1 mt-6 sm:grid-cols-2 gap-6">
					{[
						{ title: "Movie code", className: "movie-btn" },
						{title:"Series code",className:"series-btn"}
					].map(({ title, className }) => {
						const html = data?.files ? generateButtonsHTML(data.files, className):"";
						return (
							<div key={title} className="bg-slate-800 p-4 rounded-xl shadow-lg"  >
								<h3 className="text-lg font-semibold tetx-gray-200 mb-2">{title}</h3>
								<textarea className="w-full h-40 p-2 text-sm text-gray-200 bg-slate-700 border border-slate-600 rounded resize-none mb-2" readOnly value={data?.files ? generateButtonsHTML(data.files,className):""} />
								<button className="px-4 py-2bg-emerald-600 text-white rounded hover:bg-emerald-700 "
									onClick={() => copyToClipboard(data?.files ? generateButtonsHTML(data.files,className):"")}>Copy</button>
							</div>
						);
					})}

				</div>
			</div>
		</div>
	);
};
