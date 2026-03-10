import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ImageUploadCropProps {
  onImageSelected: (imageUrl: string) => void;
  currentImage?: string;
}

export default function ImageUploadCrop({ onImageSelected, currentImage }: ImageUploadCropProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(currentImage || null);
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const uploadMutation = trpc.upload.image.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máximo 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string);
      setIsOpen(true);
      setScale(1);
    });
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async () => {
    if (!imageSrc) return;

    try {
      setIsUploading(true);
      // Create canvas and process image with scale
      const image = new Image();
      image.src = imageSrc;

      image.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        // Create square canvas (1:1 aspect ratio)
        const size = Math.min(image.width, image.height);
        canvas.width = size;
        canvas.height = size;

        // Center crop
        const x = (image.width - size) / 2;
        const y = (image.height - size) / 2;

        ctx.drawImage(
          image,
          x,
          y,
          size,
          size,
          0,
          0,
          size,
          size
        );

        // Convert to base64 string
        const base64Image = canvas.toDataURL("image/jpeg", 0.9);
        
        // Upload to S3
        try {
          const result = await uploadMutation.mutateAsync({
            base64: base64Image,
          });
          onImageSelected(result.url);
          setIsOpen(false);
          setImageSrc(null);
          setIsUploading(false);
          toast.success("Imagem salva com sucesso!");
        } catch (uploadError) {
          setIsUploading(false);
          toast.error("Erro ao fazer upload da imagem");
          console.error(uploadError);
        }
      };
    } catch (error) {
      setIsUploading(false);
      toast.error("Erro ao processar imagem");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      {currentImage && (
        <div className="relative w-full aspect-square bg-slate-700 rounded-lg overflow-hidden">
          <img
            src={currentImage}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onImageSelected("")}
            className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-600 rounded text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <label className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            disabled={isUploading}
            onClick={(e) => {
              const input = e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement;
              if (input) input.click();
            }}
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Selecionar Imagem
          </Button>
        </label>
      </div>

      {isOpen && imageSrc && (
        <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="text-cyan-400">Ajustar Imagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-full h-64 bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={imageSrc}
                alt="Preview"
                style={{
                  transform: `scale(${scale})`,
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
                className="transition-transform"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Zoom: {scale.toFixed(1)}x</label>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.1}
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCropConfirm}
                disabled={isUploading}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </Button>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setImageSrc(null);
                }}
                disabled={isUploading}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-400 disabled:opacity-50"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
