. video.sh

rm -rf $video/per_second
mkdir -p $video/per_second

# ffmpeg -i $video/clipped.mp4 -vf fps=1 -frame_pts true $video/per_second/%05d.png

ffmpeg -i $video/clipped.mp4 -vf "select=not(mod(n\,$fps))" -vsync 0 -frame_pts true $video/per_second/%05d.png
