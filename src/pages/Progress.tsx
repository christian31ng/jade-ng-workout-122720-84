import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, Upload, Trash2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ProgressPhoto {
  url: string;
  timestamp: number;
}

const Progress = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [previousPhoto, setPreviousPhoto] = useState<ProgressPhoto | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState<ProgressPhoto | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const savedProgress = localStorage.getItem('progressPhotos');
    if (savedProgress) {
      const progressData = JSON.parse(savedProgress);
      setPreviousPhoto(progressData.previous || null);
      setCurrentPhoto(progressData.current || null);
    }
  }, []);

  const saveProgressToStorage = (previous: ProgressPhoto | null, current: ProgressPhoto | null) => {
    const progressData = { previous, current };
    localStorage.setItem('progressPhotos', JSON.stringify(progressData));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file only",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64 for localStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: ProgressPhoto = {
          url: reader.result as string,
          timestamp: Date.now()
        };

        let newPrevious = previousPhoto;
        let newCurrent = currentPhoto;

        if (!currentPhoto) {
          // First upload - becomes current
          newCurrent = newPhoto;
        } else {
          // Subsequent uploads - current becomes previous, new becomes current
          newPrevious = currentPhoto;
          newCurrent = newPhoto;
        }

        setPreviousPhoto(newPrevious);
        setCurrentPhoto(newCurrent);
        saveProgressToStorage(newPrevious, newCurrent);

        toast({
          title: "Photo Uploaded",
          description: "Your progress photo has been saved successfully!"
        });

        setIsUploading(false);
      };

      reader.onerror = () => {
        toast({
          title: "Upload Error",
          description: "Failed to upload photo. Please try again.",
          variant: "destructive"
        });
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive"
      });
      setIsUploading(false);
    }

    // Reset input
    event.target.value = '';
  };

  const handleClearProgress = () => {
    localStorage.removeItem('progressPhotos');
    setPreviousPhoto(null);
    setCurrentPhoto(null);
    
    toast({
      title: "Progress Cleared",
      description: "All progress photos have been removed from storage"
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 relative overflow-x-hidden pb-safe-area-inset-bottom">
      <div className="mobile-container max-w-4xl mx-auto relative z-10 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-0">
          <Button
            variant="ghost"
            onClick={() => navigate('/summary')}
            className="mobile-button text-foreground hover:bg-muted/50 shadow-3d hover:shadow-3d-hover"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold text-center bg-gradient-to-r from-fitness-primary to-fitness-secondary bg-clip-text text-transparent px-4">
            Progress Tracking
          </h1>
          <div className="w-16 sm:w-20"></div>
        </div>

        {/* Upload Section */}
        <Card className="mobile-card mb-6 border border-fitness-primary/30 bg-gradient-to-r from-fitness-primary/10 to-fitness-primary/5 glass-card backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-fitness-primary text-lg font-semibold">
              <div className="p-2 rounded-xl bg-fitness-primary/20 shadow-3d">
                <Camera className="w-5 h-5" />
              </div>
              Upload Progress Photo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="photo-upload" className="text-sm font-medium text-foreground mb-2 block">
                Upload a new progress photo
              </Label>
              <div className="relative">
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                  className="mobile-input w-full h-16 bg-background/50 border-fitness-primary/30 text-foreground file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-fitness-primary file:text-background hover:file:bg-fitness-primary/90 file:shadow-3d file:transition-all file:duration-200"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-md">
                    <RefreshCw className="w-5 h-5 animate-spin text-fitness-primary" />
                  </div>
                )}
              </div>
            </div>

            {(previousPhoto || currentPhoto) && (
              <Button
                onClick={handleClearProgress}
                variant="outline"
                className="w-full mobile-button border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Progress
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Progress Photos Display */}
        {(previousPhoto || currentPhoto) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Previous Photo */}
            <Card className="mobile-card border border-fitness-secondary/30 bg-gradient-to-br from-fitness-secondary/10 to-fitness-secondary/5 glass-card backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-fitness-secondary flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-fitness-secondary shadow-glow" />
                  Previous
                </CardTitle>
                {previousPhoto && (
                  <p className="text-sm text-muted-foreground">
                    {formatDate(previousPhoto.timestamp)}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {previousPhoto ? (
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-background/30 shadow-3d">
                    <img
                      src={previousPhoto.url}
                      alt="Previous progress photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-fitness-secondary/30 bg-background/20 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-8 h-8 mx-auto mb-2 text-fitness-secondary/50" />
                      <p className="text-sm text-muted-foreground">No previous photo</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Photo */}
            <Card className="mobile-card border border-fitness-success/30 bg-gradient-to-br from-fitness-success/10 to-fitness-success/5 glass-card backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-fitness-success flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-fitness-success shadow-glow" />
                  Current
                </CardTitle>
                {currentPhoto && (
                  <p className="text-sm text-muted-foreground">
                    {formatDate(currentPhoto.timestamp)}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {currentPhoto ? (
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-background/30 shadow-3d">
                    <img
                      src={currentPhoto.url}
                      alt="Current progress photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-fitness-success/30 bg-background/20 flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-fitness-success/50" />
                      <p className="text-sm text-muted-foreground">Upload your first photo</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="mobile-card text-center py-12 border border-muted/30 bg-gradient-to-br from-muted/10 to-transparent glass-card">
            <CardContent>
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-fitness-primary/20 flex items-center justify-center shadow-3d">
                  <Camera className="w-8 h-8 text-fitness-primary" />
                </div>
                <p className="text-foreground mb-6 text-base font-medium">
                  Start tracking your fitness progress by uploading your first photo!
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Your photos are stored locally on your device and will show side-by-side comparisons as you upload new ones.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Progress;