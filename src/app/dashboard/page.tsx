"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Braces,
  CloudUpload,
  Code,
  FolderPlus,
  Loader2,
  Trash,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/custom-ui/image-upload";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadPopupVisible, setUploadPopupVisible] = useState(false);

  const getAllImages = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/images");
      setImages(data.images);
    } catch (error) {
      console.error("Failed to fetch images:", error);
      toast({
        title: "Error",
        description: "Failed to fetch images. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    getAllImages();
  }, [getAllImages]);

  const uploadImage = async (files: File[]) => {
    setUploading(true);
    setUploadPopupVisible(false);
    const images: string[] = [];

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
        images.push(response.data[0].imageUrl);
      })
    );
    console.log(images);

    setImages((prev) => [...prev, ...images]);

    toast({
      title: "Image Uploaded",
      description: "Image uploaded successfully",
      variant: "success",
    });
    setUploading(false);
  };

  return (
    <main className="min-h-screen relative">
      <nav className="bg-primary h-14 flex items-center">
        <section className="flex gap-2 items-center text-white _container">
          <Braces className="w-5 h-5" />
          <p className="text-lg">NextJs CDN</p>
        </section>
      </nav>
      <div>
        <section className="container mt-8 px-auto">
          <p className="text-xl border-b-2 border-primary inline-block pr-4">
            Images
          </p>
          <div className="flex flex-wrap gap-4 mt-6 max-h-[calc(100vh-18rem)] overflow-y-scroll scroll-bar">
            {images?.map((imgUrl) => (
              <div key={imgUrl} className="h-36 w-36 relative group">
                <img
                  src={imgUrl}
                  alt="Uploaded Image"
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300 group-hover:opacity-50 border rounded-xl"
                />
                <div className="absolute opacity-0 top-0 left-0 w-full h-full flex group-hover:opacity-100 items-center justify-center gap-2 transition-all duration-300">
                  <Button
                    size="icon"
                    onClick={() => {
                      navigator.clipboard
                        .writeText(imgUrl)
                        .then(() => {
                          toast({
                            title: "Copied",
                            description: "Image URL copied to clipboard",
                            variant: "success",
                          });
                        })
                        .catch((err) => {
                          toast({
                            title: "Error",
                            description: "Failed to copy URL",
                            variant: "destructive",
                          });
                        });
                    }}
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={async () => {
                      await axios.delete(`/api/images/`, {
                        data: {
                          imageUrl: imgUrl,
                        },
                      });
                      setImages((prev) => prev.filter((url) => url !== imgUrl));
                      toast({
                        title: "Image Deleted",
                        description: "Image deleted successfully",
                        variant: "success",
                      });
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="absolute bottom-8 left-0 right-0 z-10 bg-white p-4 flex justify-center gap-4">
        <Dialog open={uploadPopupVisible} onOpenChange={setUploadPopupVisible}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              {...(uploading && { disabled: true })}
              onClick={() => setUploadPopupVisible(true)}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CloudUpload className="w-5 h-5 mr-2" />
              )}
              <span>Uploading</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <ImageUpload onDrop={uploadImage} />
            </div>
            <DialogFooter>
              <Button type="submit">Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="lg"
              variant="outline"
              {...(uploading && { disabled: true })}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FolderPlus className="w-5 h-5 mr-2" />
              )}
              <span>New Folder</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Folder</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input placeholder="Folder Name" />
            </div>
            <DialogFooter>
              <Button type="submit">
                <FolderPlus className="w-5 h-5 mr-2" />
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* <Toast ref={toast} /> */}
      {/* <Dialog
        visible={uploadPopupVisible}
        style={{ width: "50vw" }}
        onHide={() => {
          if (!uploadPopupVisible) return;
          setUploadPopupVisible(false);
        }}
      ></Dialog> */}
    </main>
  );
}
