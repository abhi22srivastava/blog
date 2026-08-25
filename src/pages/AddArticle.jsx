import Header from "../components/Header";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Pencil,
  Eye,
  Trash2,
} from "lucide-react";

function AddArticle() {
  const API_URL = "http://127.0.0.1:8000";
  const quillRef = useRef(null);
  const [topicList, setTopicList] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("0");
  const [isSaving, setIsSaving] = useState(false);
  const [formMessage, setFormMessage] = useState("");


const handleTopicChange = (selectedOptions) => {
    setSelectedTopics(
        (selectedOptions || []).map((option) => ({
            id: option.value,
            name: option.label,
        }))
    );
};


const handleEditorChange = (value) => {
    const quill = quillRef.current?.getEditor();

    if (!quill) {
        setContent(value);
        return;
    }

    const selection = quill.getSelection();
    const scrollTop = quill.root.scrollTop;

    setContent(value);

    // Restore editor position after React re-render
    requestAnimationFrame(() => {
        const editor = quillRef.current?.getEditor();

        if (!editor) return;

        if (selection) {
            editor.setSelection(selection.index, selection.length, "silent");
        }

        editor.root.scrollTop = scrollTop;
    });
};



 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!title.trim() || !content.trim()) {
    setFormMessage("Please add an article title and content.");
    return;
  }

  setIsSaving(true);
  setFormMessage("");

  try {
    const contentForDatabase = convertImagesForDatabase(content);
    const response = await fetch("http://127.0.0.1:8000/api/article/savearticle", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userid,
        topics: selectedTopics,
        title: title.trim(),
        slug,
        status,
         content: contentForDatabase,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to save the article.");
    }

    setFormMessage("Article saved successfully.");
    setSelectedTopics([]);
    setTitle("");
    setSlug("");
    setContent("");
    setStatus("0");
    
  } catch (error) {
    setFormMessage(error.message || "Unable to save the article.");
  } finally {
    setIsSaving(false);
  }
};

const getImageUrl = (path) => {
    if (!path) return "";

    // Already a full URL
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    // Remove leading slash
    path = path.replace(/^\/+/, "");

    // If Laravel returns article/image/...
    if (path.startsWith("article/")) {
        return `${API_URL}/storage/${path}`;
    }

    // If path already contains storage/
    if (path.startsWith("storage/")) {
        return `${API_URL}/${path}`;
    }

    return `${API_URL}/storage/${path}`;
};


const handleReset = () => {
  setSelectedTopics([]);
  setTitle("");
  setSlug("");
  setContent("");
  setStatus("Draft");
  setFormMessage("");
};

const handleTitleChange = (e) => {
    const value = e.target.value;

    setTitle(value);

    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-")
    );
  };


/*
 const topicList = [
  { id: 1, name: "business" },
  { id: 3, name: "Health" },
  { id: 4, name: "Education" },
  { id: 5, name: "Technology" },
  
]; */

const videoHandler = () => {
  const url = prompt("Enter YouTube or Video URL");

  if (!url) return;

  const quill = quillRef.current.getEditor();

  const range = quill.getSelection(true);

  quill.insertEmbed(range.index, "video", url);
};



const convertImagesForEditor = (html) => {
    if (!html) return "";

    return html.replace(
        /src="(\/storage\/[^"]+)"/g,
        `src="${API_URL}$1"`
    );
};

const convertImagesForDatabase = (html) => {
    if (!html) return "";

    return html.replace(
        new RegExp(
            `src="${API_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/storage/([^"]+)"`,
            "g"
        ),
        'src="/storage/$1"'
    );
};


const imageHandler = () => {
    const input = document.createElement("input");

    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
        const file = input.files?.[0];

        if (!file) return;

        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch(
                `${API_URL}/api/article/upload_images`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to upload the image."
                );
            }

            const imagePath = data.path;

            if (!imagePath) {
                throw new Error("Image path was not returned.");
            }

            // Full URL ONLY for Quill editor
            const imageUrl = getImageUrl(imagePath);

            const quill = quillRef.current.getEditor();
            const range = quill.getSelection(true);

            quill.insertEmbed(
                range ? range.index : quill.getLength(),
                "image",
                imageUrl
            );

            quill.setSelection(
                (range ? range.index : quill.getLength()) + 1
            );

        } catch (error) {
            console.error(error);
            setFormMessage(
                error.message || "Unable to upload the image."
            );
        }
    };
};


const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, 4, false] }],
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
    handlers: {
      image: imageHandler,
      video: videoHandler,
    },
  },
};



  const user = JSON.parse(localStorage.getItem("user"));
  const userid = user?.id;
  const token = localStorage.getItem("token");

  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchTopics();
  }, []);


  const fetchTopics = async () => {
    try {
        const response = await fetch(
            `${API_URL}/api/article/gettopicsList`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to fetch topics."
            );
        }

        setTopicList(data.data || []);
        console.log("Fetched topics:", data.data);
    } catch (error) {
        console.error("Topics error:", error);
        setFormMessage(error.message || "Unable to fetch topics.");
    }
};

  const totalPosts = articles.length;
  const published = articles.filter(
    (a) => a.status === "Published"
  ).length;
  const drafts = articles.filter(
    (a) => a.status !== "Published"
  ).length;

  return (
    <>
      <Header />

      <div className="flex min-h-screen bg-gray-100">

        {/* Sidebar */}

        <div className="w-64 bg-white shadow-lg">

          <div className="p-6 border-b">
       
        <img
  src="http://127.0.0.1:8000/frontend/images/largeimg.jpg"
  alt={user.name}
  className="w-24 h-24 rounded-full object-cover border-4 border-white"
/>

      

            <p className="text-gray-500">
              {user.name}
            </p>

          </div>

          <ul className="mt-5">

            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-3 p-4 hover:bg-blue-50"
              >
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/add-article"
                className="flex items-center gap-3 p-4 hover:bg-blue-50"
              >
                <PlusCircle size={20} />
                Add Article
              </Link>
            </li>

            <li>
              <Link
                to="/my-articles"
                className="flex items-center gap-3 p-4 hover:bg-blue-50"
              >
                <FileText size={20} />
                My Articles
              </Link>
            </li>

          </ul>

        </div>

        {/* Main */}

        <div className="flex-1 p-8">

          {/* Welcome */}

       

          {/* Stats */}

         

          {/* Recent Articles */}

       <div className="bg-white rounded-xl shadow mt-8">

        <form onSubmit={handleSubmit} className="p-8">

          {formMessage && (
            <p className="mb-6 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {formMessage}
            </p>
          )}

         {/* Topics */}
<div className="mb-6">
  <label className="block font-semibold mb-2">
    Topics
  </label>

 

  <Select
    isMulti
    isSearchable
    options={topicList.map((topic) => ({
        value: topic.id,
        label: topic.name,
    }))}
    value={selectedTopics.map((topic) => ({
        value: topic.id,
        label: topic.name,
    }))}
    onChange={handleTopicChange}
    placeholder="Select topics..."
    noOptionsMessage={() => "No topics found"}
/>










  <p className="text-sm text-gray-500 mt-2">
    Select one or more topics. You can search by topic name.
  </p>
</div>

          {/* Title */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">
              Article Title
            </label>

            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter article title"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Slug */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">
              Slug
            </label>

            <input
              type="text"
              value={slug}
              readOnly
              className="w-full border rounded-lg px-4 py-3 bg-gray-100"
            />
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="0">Un Published</option>
              <option value="1">Published</option>
            </select>
          </div>

          {/* Content */}
          <div className="mb-8">
           <label className="block font-semibold mb-2">
        Content
    </label>
      <div className="quill-wrapper">
        <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={handleEditorChange}
            modules={modules}
        />
    </div>
          </div>

          {/* Buttons */}
          <div className="pt-12 flex gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              {isSaving ? "Saving..." : "Save Article"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-300 hover:bg-gray-400 px-6 py-3 rounded-lg"
            >
              Reset
            </button>
          </div>

        </form>

                 </div>

        </div>

      </div>

    </>
  );
}

export default AddArticle;
