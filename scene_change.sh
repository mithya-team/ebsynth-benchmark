. video.sh

rm -rf $video/scene_change
mkdir -p $video/scene_change
ffmpeg -i $video/clipped.mp4 -vf "select='gt(scene\\,$change)'" -vsync 0 -frame_pts true $video/scene_change/%05d.png