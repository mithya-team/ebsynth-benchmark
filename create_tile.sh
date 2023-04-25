. video.sh


cd $video/counted_frames

# ffmpeg -i 00000.png -i 00030.png -i 00060.png -i 00090.png -i 00120.png -i 00150.png -i 00180.png -i 00210.png \
# -filter_complex "[0][1][2][3][4][5][6][7]hstack=inputs=8" ../tile.png -y


ffmpeg -i 00000.png -i 00026.png -i 00052.png \
       -i 00078.png -i 00104.png -i 00130.png \
       -i 00156.png -i \
-filter_complex "[0:v][1:v][2:v][3:v][4:v][5:v][6:v]xstack=inputs=7\
:layout=0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h1" ../tile.png -y
