import Header from "../components/Header";
import DashboardSidebar from "../components/DashboardSidebar";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { API_BASE_URL } from "../config/api";
import { calculateProfileCompletion } from "../utils/profileCompletion";

function AddArticle() {
  const API_URL = API_BASE_URL;
  const { id: articleId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(articleId);
  const quillRef = useRef(null);
  const [topicList, setTopicList] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [showSource, setShowSource] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("0");
  const [isSaving, setIsSaving] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [isLoadingArticle, setIsLoadingArticle] = useState(isEditing);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);


const handleTopicChange = (option) => {
    setSelectedTopic(option ? { id: option.value, name: option.label } : null);
};

const handleCreateTopic = async (name) => {
  const topicName = name.trim();
  if (!topicName || isCreatingTopic) return;
  const currentToken = localStorage.getItem("token");

  if (!currentToken) {
      setFormMessage("Your session has expired. Please sign in again.");
      return;
  }

  setIsCreatingTopic(true);
  setFormMessage("");
  try {
      const response = await fetch(`${API_URL}/api/article/topics`, {
          method: "POST",
          headers: {
              Authorization: `Bearer ${currentToken}`,
              Accept: "application/json",
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: topicName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to create topic.");

      const topic = data.data;
      setTopicList((current) => current.some((item) => String(item.id) === String(topic.id))
          ? current
          : [...current, topic].sort((first, second) => first.name.localeCompare(second.name)));
      setSelectedTopic(topic);
      setFormMessage(data.message || "Topic created successfully.");
  } catch (error) {
      setFormMessage(error.message || "Unable to create topic.");
  } finally {
      setIsCreatingTopic(false);
  }
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
    const response = await fetch(
      isEditing
        ? `${API_URL}/api/article/updatearticle/${articleId}`
        : `${API_URL}/api/article/savearticle`,
      {
      // The article API uses action endpoints (savearticle/updatearticle), so both save actions use POST.
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userid,
        topics: selectedTopic ? [selectedTopic] : [],
        title: title.trim(),
        slug,
        status,
         content: contentForDatabase,
      }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to save the article.");
    }

    setFormMessage(
      data.message || "Article saved successfully."
    );

    if (isEditing) {
      navigate("/dashboard");
      return;
    }

    setSelectedTopic(null);
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
  setSelectedTopic(null);
  setTitle("");
  setSlug("");
  setContent("");
  setStatus("0");
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

        setIsUploading(true);
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

            const imagePath = data.url || data.path;

            if (!imagePath) {
                throw new Error("Image path was not returned.");
            }

            // Full URL ONLY for Quill editor
            const imageUrl = getImageUrl(imagePath);

            const quill = quillRef.current?.getEditor();
            if (!quill) throw new Error("Editor unavailable. Please retry the upload.");
            const range = quill.getSelection(true);
            const insertionIndex = range ? range.index : Math.max(0, quill.getLength() - 1);

            quill.insertEmbed(
                insertionIndex,
                "image",
                imageUrl,
                "user"
            );

            quill.setSelection(
                insertionIndex + 1, 0, "silent"
            );
            setContent(quill.root.innerHTML);

        } catch (error) {
            console.error(error);
            setFormMessage(
                error.message || "Unable to upload the image."
            );
        } finally {
            setIsUploading(false);
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



  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userid = user?.id;
  const completionPercent = calculateProfileCompletion(user);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!isEditing || !articleId || !userid || !token) return;
    if (topicList.length === 0) return;

    const fetchArticle = async () => {
        try {
            setIsLoadingArticle(true);

            const response = await fetch(
                `${API_URL}/api/article/${userid}`,
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
                    data.message || "Unable to load the article."
                );
            }

            const article = (data.data || []).find(
                (item) => String(item.id) === String(articleId)
            );

            if (!article) {
                setFormMessage("Article not found.");
                return;
            }

            const articleTopics =
                article.topics ??
                article.article_topics ??
                article.topic_list ??
                article.topic_ids ??
                article.topicid ??
                article.topic_id ??
                [];
            const topicItems = Array.isArray(articleTopics)
                ? articleTopics
                : String(articleTopics).split(",");
            const topicIds = topicItems
                .map((item) =>
                    typeof item === "object"
                        ? item.topic_id ?? item.id ?? item.pivot?.topic_id
                        : item
                )
                .filter((id) => id != null && String(id).trim() !== "");

            // Use the exact option objects so react-select marks them as selected.
            setSelectedTopic(
                topicList.find((topic) => String(topic.id) === String(topicIds[0])) || null
            );

            setTitle(article.title || "");
            setSlug(article.slug || "");

            setContent(
                convertImagesForEditor(
                    article.content ||
                    article.long_description ||
                    ""
                )
            );

            setStatus(String(article.status ?? "0"));

        } catch (error) {
            console.error("Edit article error:", error);

            setFormMessage(
                error.message || "Unable to load the article."
            );
        } finally {
            setIsLoadingArticle(false);
        }
    };

    fetchArticle();

}, [
    articleId,
    isEditing,
    token,
    userid,
    topicList
]);


  async function fetchTopics() {
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
  }

  useEffect(() => {
    fetchTopics();
  }, []);

  return (
    <>
      <Header />

      <div className="flex min-h-screen flex-col bg-gray-100 lg:flex-row">
        <DashboardSidebar user={user} completionPercent={completionPercent} />

        {/* Main */}

        <div className="min-w-0 flex-1 p-4 sm:p-8">

          {/* Welcome */}

       

          {/* Stats */}

         

          {/* Recent Articles */}

       <div className="bg-white rounded-xl shadow mt-8">

        <form onSubmit={handleSubmit} className="p-8">

          <h1 className="mb-6 text-2xl font-bold">
            {isEditing ? "Edit Article" : "Add Article"}
          </h1>

          {formMessage && (
            <p className="mb-6 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {formMessage}
            </p>
          )}

         {/* Topics */}
<div className="mb-6">
  <label className="block font-semibold mb-2">
    Topic
  </label>

 

  <CreatableSelect
    isSearchable
    isDisabled={isCreatingTopic}
    options={topicList.map((topic) => ({
        value: topic.id,
        label: topic.name,
    }))}
    value={selectedTopic ? { value: selectedTopic.id, label: selectedTopic.name } : null}
    onChange={handleTopicChange}
    placeholder="Select a topic..."
    noOptionsMessage={() => "No topics found. Type a topic name to create it."}
    onCreateOption={handleCreateTopic}
    formatCreateLabel={(inputValue) => `Create topic "${inputValue}"`}
/>










  <p className="text-sm text-gray-500 mt-2">
    Select one topic, or type a new topic name and choose the create option.
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
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
            >
              <option value="0">Draft</option>
              <option value="1">Published</option>
              <option value="2">Deactivated</option>
            </select>
            <p className="mt-2 text-sm text-slate-500">
              Published articles are visible to readers. Draft and deactivated articles are hidden.
            </p>
          </div>

          {/* Content */}
          <div className="mb-8">
           <div className="mb-3 flex items-center justify-between gap-3">
             <span className="font-semibold">Content</span>
             <button type="button" disabled={isUploading || isLoadingArticle} aria-pressed={showSource}
               onClick={() => {
                 if (!showSource) setContent(quillRef.current?.getEditor().root.innerHTML ?? content);
                 setShowSource(!showSource);
               }}
               className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50">
               {showSource ? "Visual editor" : "View source"}
             </button>
           </div>
           {isUploading && <p role="status" className="mb-3 text-sm text-blue-600">Uploading image…</p>}
           {showSource && (
             <div>
               <p id="article-source-help" className="mb-2 text-sm text-slate-500">Article HTML, including uploaded image URLs in img src attributes.</p>
               <textarea aria-label="Article HTML source" aria-describedby="article-source-help" spellCheck={false} readOnly
                 value={content}
                 className="min-h-80 w-full rounded-lg border border-slate-300 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 focus:outline-2 focus:outline-blue-500" />
             </div>
           )}
      <div className="quill-wrapper" hidden={showSource}>
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
              disabled={isSaving || isLoadingArticle || isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              {isSaving ? "Saving..." : isEditing ? "Save changes" : "Publish article"}
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
