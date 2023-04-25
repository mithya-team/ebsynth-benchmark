. video.sh

rm -rf $video/counted_frames
mkdir -p $video/counted_frames

duration=$((end-start))
total_frames=$((duration*fps))
count=$((total_frames/count))


ffmpeg -i $video/clipped.mp4 -vf "select=not(mod(n\,$count))" -vsync 0 -frame_pts true $video/counted_frames/%05d.png