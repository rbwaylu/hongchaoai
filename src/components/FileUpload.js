import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage("请选择一个文件");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:8000/api/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage("文件上传失败");
            console.error("文件上传失败", error);
        }
    };

    return (
        <div>
            <h2>上传知识库文件</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>上传</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default FileUpload;