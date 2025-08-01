import { useState } from "react";
import { Search } from "lucide-react";

import { Toaster,toast } from "sonner";

export const Home = () => {
	const [postId, setPostId] = useState("");
	const [type, setType] = useState("movie");
	const [data, setData] = useState(null);
	const [fileInfos, setFileInfos] = useState([]);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const G_API_KEY = import.meta.env.VITE_G_API_KEY;
	const MODPRO_API_KEY = import.meta.env.VITE_MODPRO_API_KEY;
	
	
	

	const fetchAllDriveFileInfo = async (fileIds) => {
		const requests = fileIds.map((id) =>
			fetch(`https://www.googleapis.com/drive/v3/files/${id}?key=${G_API_KEY}&fields=id,name,size,mimeType,webContentLink&supportsAllDrives=true&includeItemsFromAllDrives=true`)
				.then((res) => {
					if (!res.ok) throw new Error(`Failed to fetch ${id}`);
					return res.json();
				})
				.catch(() => null)
		);
		const results = await Promise.all(requests);
		setFileInfos(results.filter(Boolean));

	};
	const extractDriveId = (input) => {
		if (!input) return null;
		if (!input.includes("/")) return input;

		const match = input.match(/[-\w]{25,}/);
		return match ? match[0] : null;
		
	};
	const fetchDriveItemInfo = async (input) => {
		

		const id = extractDriveId(input);
		if (!id) {
			setError("Invalid Google Drive URL or ID.");
			setIsLoading(false);
			return;
		}
		try {
      
			const metaRes = await fetch(
				`https://www.googleapis.com/drive/v3/files/${id}?key=${G_API_KEY}&fields=id,name,mimeType,size,webContentLink&supportsAllDrives=true&includeItemsFromAllDrives=true`
			);

			if (!metaRes.ok) {
				throw new Error("Failed to fetch file/folder metadata.");
			}
			const meta = await metaRes.json();

			if (meta.mimeType === "application/vnd.google-apps.folder") {
        
				const folderFiles = await fetchFolderContents(id);
				if (folderFiles.length === 0) {
					setError("Folder is empty or access denied.");
					setIsLoading(false);
					return;
				}
				setData({ title: meta.name, files: folderFiles.map((f) => f.id) });
				setFileInfos(folderFiles);
			} else {
        
				setData({ title: meta.name, files: [meta.id] });
				setFileInfos([meta]);
			}
		} catch (err) {
			setError(err.message || "Failed to fetch Google Drive data.");
		} finally {
			setIsLoading(false);
		}
	};

 
	const fetchFolderContents = async (folderId) => {
		const files = [];
		let pageToken = null;

		do {
			const url = new URL(
				`https://www.googleapis.com/drive/v3/files?key=${G_API_KEY}&fields=nextPageToken,files(id,name,mimeType,size,webContentLink)&q='${folderId}'+in+parents&supportsAllDrives=true&includeItemsFromAllDrives=true`
			);
			if (pageToken) {
				url.searchParams.append("pageToken", pageToken);
			}
			const res = await fetch(url);
			if (!res.ok) throw new Error("Failed to fetch folder contents");
			const json = await res.json();
			files.push(...json.files);
			pageToken = json.nextPageToken;
		} while (pageToken);

		return files;
	};
	

	const fetchData = async () => {
		setError("");
		setData(null);
		setFileInfos([]);
		setIsLoading(true);

		if (!postId.trim()) {
			toast.error("Please enter a valid Url or ID.");
			setIsLoading(false);
			return;
		}


		if (type === "drive") {
			await fetchDriveItemInfo(postId);
		} else
		{ 
		const baseURL =
			type === "movie"
				? "https://links.modpro.blog/wp-json/wp/clenc/files"
				: "https://episodes.modpro.blog/wp-json/wp/clenc/files";

		try {
			const url = `${baseURL}?api_key=${MODPRO_API_KEY}&files=${postId.trim()}`;
			const res = await fetch(url);
			if (res.status === 401) {
				throw new Error("Authentication failed - please check your API key");
			}
			const result = await res.json();
			console.log("API result:", result);
			if (!result) {
				
				throw new Error("No data found for this Post ID.");
			}

			setData(result);
			
			if (result.files?.length > 0) {
				await fetchAllDriveFileInfo(result.files);
			}
		} catch (err) {
			
			setError(err.message || "Failed to fetch data. Please try again."); 
		} finally {
			setIsLoading(false); 
		}
	}
};
	const generateButtonsHTML = (fileIds, className) => {
		return `<!-- wp:buttons{"layout":{"type":"flex","justifyContent":"center","orientation":"vertical"}}-->\n <div class="wp-block-buttons">\n${fileIds
			.map(
				(id, index) => `<!--wp:buttons{"className":"${className}"}-->\n <div class="wp-block-button ${className}"><a class="wp-block-button__link wp-element-button" href=\"https://drive.google.com/uc?id=${id}&export=download\" target=\"_blank\" rel=\"noreferrer noopener nofollow\">Server ${index + 1}</a></div>\n  <!--/wp:button-->`
			).join("\n")}\n<!--/wp:buttons-->`;
	};
	const generateButtonHTML = (fileIds, className) => {
		return `<!-- wp:buttons{"layout":{"type":"flex","justifyContent":"center","orientation":"vertical"}}-->\n <div class="wp-block-buttons">\n${fileIds
			.map(
				(id, index) => `<!--wp:buttons{"className":"${className}"}-->\n <div class="wp-block-button ${className}"><a class="wp-block-button__link wp-element-button" href=\"https://drive.google.com/uc?id=${id}&export=download\" target=\"_blank\" rel=\"noreferrer noopener nofollow\">Episode ${index + 1}</a></div>\n  <!--/wp:button-->`
			).join("\n")}\n</div>\n<!--/wp:buttons-->`;
	};
	const generateBtnHTML = (fileIds, className) => {
		return `<!-- wp:buttons{"layout":{"type":"flex","justifyContent":"center","orientation":"horizontal"}}-->\n <div class="wp-block-buttons">\n${fileIds
			.map(
				(id, index) => `<!--wp:button{"className":"${className}"}-->\n <div class="wp-block-button ${className}"><a class="wp-block-button__link wp-element-button" href=\"https://drive.google.com/uc?id=${id}&export=download\" target=\"_blank\" rel=\"noreferrer noopener nofollow\">Server ${index + 1}</a></div>\n  <!--/wp:button-->`
			).join("\n")}\n</div>\n<!--/wp:buttons-->`;
	}


	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
		toast.success("Code Copied to clipboard.");
	};

	return (

		<div className=" w-full min-h-screen overflow-x-hidden bg-slate-900 text-gray-100  ">
			<Toaster theme="dark" position="top-left" richColors expand={true} toastOptions={{
				style: {
					marginTop: "3rem",
					fontSize:"16px",
				}
			}}
			closeButton/>
		
			<nav className="w-full py-3  bg-slate-700 flex  items-center justify-between gap-6 mb-6 px-4">
				<h1 className="font-mono text-xl ">ExtDrama</h1>
				<div className=" flex-grow flex  items-center  justify-end  ">
					<div className="flex items-center rounded-lg border border-slate-600 px-3 py-2 gap-4">
						
						<input
							className="flex-grow bg-transparent border-none  text-gray-200 placeholder-slate-400  outline-none"
							type="text"
							placeholder={
								type === "drive"
									? "Enter Drive file or folder Url..."
									:"Enter post ID..."
							}
							value={postId}
							onChange={(e) => setPostId(e.target.value)}
						/>
						<select
							value={type}
							onChange={(e) => setType(e.target.value)}
							className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
						>
							<option value="movie">Movie</option>
							<option value="series">Series</option>
							<option value="drive">Google Drive</option>
						</select>
					
						<button
							className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-150"
							onClick={fetchData}
							disabled={isLoading}
						>
							{isLoading ? ("Searching...") : (
								<>
									<Search size={18} />
									
								</>
							)}
						</button>
					</div>
				</div>
			</nav>
			<div className="p-4 flex flex-col items-center">
				{error && (
					<p className="text-red-300 p-3 mb-6 bg-red-700/30 border border-red-600 rounded-lg text-sm">
						{error}
					</p>
				)}
				{isLoading && !data && (
					<p className="text-emerald-400 py-4 text-center">Loading data, please wait...</p>
				)}

				<div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl">
					<div className="lg:w-2/3 space-y-4">
						{data && (
							<div className="bg-slate-700/50 p-4 sm:p-6 rounded-lg shadow-md border border-slate-600 max-h-[75vh] flex flex-col">
								<div className="shrink-0 mb-4">
									<h2 className="text-2xl font-bold text-emerald-400 truncate">{data.title}</h2>
									<p className="font-medium text-slate- overflow-clip">
										<strong>Post ID:</strong>{" "}
										{type === "drive"
											? postId
											: type === "movie"
											? `https://links.modpro.blog/${postId}`
											: type === "series"
											? `https://episodes.modpro.blog/${postId}`
											: postId}
									</p>
								</div>

								{fileInfos.length > 0 ? (
									<div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-600 space-y-4 overflow-y-auto">
										<h3 className="text-xl font-semibold text-emerald-300 mb-4">
											Google Drive File Details:
										</h3>
										{fileInfos.map((info, idx) => (
											<div key={info.id}   onClick={() => {
													const textToCopy = `
														Server ${idx + 1}
															Name: ${info.name}
															Size: ${(info.size / 1024 / 1024 / 1024).toFixed(2)} GB
															Type: ${info.mimeType}
															Link: ${info.webContentLink}
																`.trim();

														navigator.clipboard.writeText(textToCopy)
														.then(() => {
															toast.success('Info copied to clipboard!');
														})
														.catch((err) => {
															toast.error('Failed to copy:', err);
														});
													}}
												className="p-4 bg-slate-700 rounded-lg border border-slate-600 overflow-clip">
												<p><strong>Server {idx + 1}</strong></p>
												<p><strong>Name:</strong> {info.name}</p>
												<p><strong>Size:</strong> {(info.size / 1024 / 1024 / 1024).toFixed(2)} GB</p>
												<p><strong>Type:</strong> {info.mimeType}</p>
												<p>
													<strong>Link:</strong>{" "}
													<a href={info.webContentLink} target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline" onClick={(e)=>e.stopPropagation()}>
														Click Here
													</a>
												</p>
											</div>
										))}
									</div>
								) : (
									<p className="mt-4 font-medium text-slate-400">
										No downloadable files found for this entry.
									</p>
								)}
							</div>
						)}
					</div>

					{data?.files && (
						<div className="lg:w-1/3 flex flex-col gap-6">
							<div className="bg-slate-800 p-4 rounded-xl shadow-lg">
								<h3 className="text-lg font-semibold text-gray-200 mb-3">Movie Code</h3>
								<textarea
									className="w-full h-40 p-2 text-sm text-gray-200 bg-slate-700 border border-slate-600 rounded resize-none mb-2"
									readOnly
									value={generateButtonsHTML(data.files, "movie-btn")}
								/>
								<button
									className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
									onClick={() =>
										copyToClipboard(generateButtonsHTML(data.files, "movie-btn"))
									}
								>
									Copy
								</button>
							</div>

							<div className="bg-slate-800 p-4 rounded-xl shadow-lg">
								<h3 className="text-lg font-semibold text-gray-200 mb-2">Series Code</h3>
								<textarea
									className="w-full h-40 p-2 text-sm text-gray-200 bg-slate-700 border border-slate-600 rounded resize-none mb-2"
									readOnly
									value={generateButtonHTML(data.files, "series-btn")}
								/>
								<button
									className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
									onClick={() =>
										copyToClipboard(generateButtonHTML(data.files, "series-btn"))
									}
								>
									Copy
								</button>

							</div>
							<div className="bg-slate-800 p-4 rounded-xl shadow-lg">
								<h3 className="text-lg font-semibold text-gray-200 mb-2">Zip Code</h3>
								<textarea className="w-full h-40 p-2 text-sm text-gray-200 bg-slate-700 border border-slate-600 rounded resize-none mb-2"
									readOnly
									value={generateBtnHTML(data.files,"zip-btn") }
								></textarea>
								<button className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
									onClick={ ()=> copyToClipboard(generateBtnHTML(data.files,"zip-btn"))}
								>
									Copy

								</button>


							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};