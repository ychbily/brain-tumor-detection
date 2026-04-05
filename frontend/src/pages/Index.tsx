import { useState, useRef, useCallback } from "react";
import { Brain, Upload, X, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Status = "idle" | "analyzing" | "result";
type Result = "positive" | "negative" | null;

const Index = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Result>(null);
  const [detectionDetails, setDetectionDetails] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setImageFile(file);
      setStatus("idle");
      setResult(null);
      setDetectionDetails(null);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const analyze = async () => {
    if (!imageFile) return;
    
    setStatus("analyzing");
    setErrorMessage(null);
    
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred during analysis.");
      }

      if (data.detection.startsWith("NO")) {
        setResult("negative");
      } else {
        setResult("positive");
      }
      setDetectionDetails(data.detection);
      setStatus("result");
    } catch (error: any) {
      setErrorMessage(error.message);
      setStatus("idle");
    }
  };

  const reset = () => {
    setImage(null);
    setImageFile(null);
    setStatus("idle");
    setResult(null);
    setDetectionDetails(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <Brain className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">BrainScan AI</h1>
          <p className="text-sm text-muted-foreground">Brain Tumor Detection</p>
        </div>
      </div>
      <Card className="w-full max-w-md p-6 shadow-lg">
        {/* Upload / Preview Area */}
        {!image ? (
			<div
	        onDragOver={(e) => e.preventDefault()}
	        onDrop={handleDrop}
	        onClick={() => fileRef.current?.click()}
	        className="border-2 border-dashed border-border rounded-xl h-64 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
	      >
            <Upload className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Drop an MRI scan here or click to upload
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden h-64 bg-muted">
            <img
              src={image}
              alt="MRI scan"
              className="w-full h-full object-contain"
            />

            {/* Scanning animation overlay */}
            {status === "analyzing" && (
              <div className="absolute inset-0 bg-primary/10">
                <div className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_12px_hsl(var(--primary))] animate-scan-line" />
                <div className="absolute inset-0 border-2 border-primary/30 rounded-xl animate-pulse-ring" />
              </div>
            )}

            {/* Remove button */}
            {status !== "analyzing" && (
              <button
                onClick={reset}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/60 flex items-center justify-center hover:bg-foreground/80 transition-colors"
              >
                <X className="w-4 h-4 text-background" />
              </button>
            )}
          </div>
        )}
        {/* Action / Status area */}
        <div className="mt-5">
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              {errorMessage}
            </div>
          )}

          {status === "idle" && image && (
            <Button onClick={analyze} className="w-full" size="lg">
              <Brain className="w-4 h-4 mr-2" />
              Analyze Scan
            </Button>
          )}

          {status === "analyzing" && (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
              </div>
              <p className="text-sm text-muted-foreground">Analyzing MRI scan…</p>
            </div>
          )}

          {status === "result" && result && (
            <div
              className={`rounded-xl p-4 flex items-start gap-3 ${
                result === "negative"
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {result === "negative" ? (
                <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {result === "negative" ? "No Tumor Detected" : "Tumor Detected"}
                </p>
                <p className="text-sm opacity-80 mt-1">
                  {detectionDetails}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <p className="text-xs text-muted-foreground mt-6 max-w-sm text-center">
        This is a demo interface. Always consult a qualified medical professional for diagnosis.
      </p>
    </div>
  );
};

export default Index;
