. video.sh

rm $video/clipped.mp4
ffmpeg -i $video/pre_processed.mp4 -filter_complex "[0]trim=end=$end:start=$start[s0];[s0]setpts=PTS-STARTPTS[s1]" -map "[s1]" $video/clipped.mp4 -y

# ffmpeg -i $video/pre_processed.mp4 -vf "trim=end=$end:start=$start" -vf "setpts=PTS-STARTPTS"  $video/clipped.mp4 -y