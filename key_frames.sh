. video.sh

rm -rf $video/key_frames
mkdir -p $video/key_frames
ffmpeg -i $video/clipped.mp4 -vf "select='eq(pict_type,I)'" -vsync 0 -frame_pts true $video/key_frames/%05d.png