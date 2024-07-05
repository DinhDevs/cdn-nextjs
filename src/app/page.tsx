"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";
import {
  Braces,
  Cloud,
  CloudUpload,
  Code,
  Code2,
  Plus,
  Trash,
} from "lucide-react";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dialog } from "primereact/dialog";
import axios from "axios";
import { Skeleton } from "primereact/skeleton";

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const toast = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPopupVisible, setUploadPopupVisible] = useState(false);

  const getAllImages = async () => {
    axios
      .get("/api/images")
      .then((response) => setImages(response.data.images))
      .catch((error) => console.error(error));
  };

  const uploadImage = async (event: FileUploadHandlerEvent) => {
    const files = event.files;
    setUploading(true);
    setUploadPopupVisible(false);

    await Promise.all(
      files.map(async (file: File) => {
        const response = await axios.post("/api/images", {
          files: [
            {
              filename: file.name,
              contentType: file.type,
            },
          ],
        });
        await axios.put(response.data[0].url, file, {
          headers: {
            "Content-Type": file.type,
            "Content-Disposition": `attachment; filename="${file.name}"`,
          },
        });
        setImages((prev) => [...prev, response.data.imageUrl]);
      })
    );

    await getAllImages();

    if (toast.current) {
      (toast.current as any).show({
        severity: "success",
        summary: "Image Uploaded",
        detail: "Image uploaded successfully",
      });
    }
    setUploading(false);
    event.options.clear();
  };

  useEffect(() => {
    getAllImages();
  }, []);
  return (
    <main className="">
      <header className="bg-blue-600 h-16 flex items-center">
        <section className="flex gap-2 container text-white">
          <Braces className="w-6 h-6" />
          <p className="text-xl">NextJs CDN</p>
        </section>
      </header>
      <div className="absolute bottom-8 left-0 right-0 z-10 bg-white p-4 flex justify-center">
        <Button
          pt={{
            root: {
              className: "px-32 rounded-2xl",
            },
          }}
          loading={uploading}
          label="Upload"
          icon={<CloudUpload className="w-5 h-5 mr-2" />}
          onClick={() => setUploadPopupVisible(true)}
        ></Button>
      </div>
      <section className="container mt-16 px-auto">
        <p className="text-xl border-b-2 border-blue-600 inline-block pr-4">
          Images
        </p>
        <div className="flex flex-wrap gap-4 mt-6 max-h-[calc(100vh-20rem)] overflow-y-scroll scroll-bar">
          {images?.map((imgUrl) => (
            <div key={imgUrl} className="h-48 w-48 relative group">
              <img
                src={imgUrl}
                alt="Uploaded Image"
                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300 group-hover:opacity-50 border rounded-xl"
              />
              <div className="absolute opacity-0 top-0 left-0 w-full h-full flex group-hover:opacity-100 items-center justify-center gap-2 transition-all duration-300">
                <Button
                  rounded
                  icon={<Code className="w-4 h-4" />}
                  onClick={() => {
                    navigator.clipboard
                      .writeText(imgUrl)
                      .then(() => {
                        (toast.current as any).show({
                          severity: "success",
                          summary: "Copied",
                          detail: "Image URL copied to clipboard",
                          life: 1000,
                        });
                      })
                      .catch((err) => {
                        console.error("Failed to copy: ", err);
                        (toast.current as any).show({
                          severity: "error",
                          summary: "Error",
                          detail: "Failed to copy URL",
                          life: 1000,
                        });
                      });
                  }}
                />
                <Button
                  rounded
                  severity="danger"
                  icon={<Trash className="w-4 h-4" />}
                  onClick={async () => {
                    await axios.delete(`/api/images/`, {
                      data: {
                        imageUrl: imgUrl,
                      },
                    });
                    getAllImages();
                    (toast.current as any).show({
                      severity: "success",
                      summary: "Image Deleted",
                      detail: "Image deleted successfully",
                    });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
      <Toast ref={toast} />
      <Dialog
        header="Upload Image"
        visible={uploadPopupVisible}
        style={{ width: "50vw" }}
        onHide={() => {
          if (!uploadPopupVisible) return;
          setUploadPopupVisible(false);
        }}
      >
        <FileUpload
          pt={{
            chooseButton: {
              className:
                "hover:cursor-pointer hover:bg-blue-600 transition-all",
            },
            progressbar: {
              root: {
                className: "hidden",
              },
            },
            content: {
              className: "max-h-[400px] overflow-y-scroll",
            },
            badge: {
              root: {
                className: "px-2",
              },
            },
          }}
          headerTemplate={(options) => {
            const { chooseButton, uploadButton, cancelButton } = options;
            return uploading ? (
              <div className="flex justify-start items-center gap-2 mb-4 h-16">
                <ProgressSpinner className="w-12 h-12" />
              </div>
            ) : (
              <div className="flex justify-start items-center gap-2 mb-4 h-16">
                {chooseButton}
                {uploadButton}
                {cancelButton}
              </div>
            );
          }}
          customUpload
          uploadHandler={uploadImage}
          multiple
          accept="image/*"
          emptyTemplate={
            <p className="m-0">Drag and drop files to here to upload.</p>
          }
          className="mt-2"
        />
      </Dialog>

    </main>
  );
}
