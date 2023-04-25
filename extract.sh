. video.sh

rm -rf $video/extract
mkdir -p $video/extract
ffmpeg -i $video/clipped.mp4 -q:v 25 -frame_pts true $video/extract/%05d.png
