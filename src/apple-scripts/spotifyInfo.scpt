if application "Spotify" is running then
	tell application "Spotify"
        set sState to (get player state)
		if true then
			set sName to (get name of current track)
			set sArtist to (get artist of current track)
            set sDuration to (get duration of current track)
            set sTime to player position
			# if (length of sName) > 25 then
			# 	set sName to text 1 thru 22 of sName & "..."
			# else
			# 	set sName to (get name of current track)
			# end if
			# if (length of sArtist) > 25 then
			# 	set sArtist to text 1 thru 22 of sArtist & "..."
			# else
			# 	set sArtist to (get artist of current track)
			# end if
			set nowPlaying to sName & "  —  " & sArtist
			set artworkURL to artwork url of current track
			do shell script "curl " & artworkURL & " -o ~/Desktop/WIP/sakthi/server/src/public/spotify_cover.png"
			set fileName to "spotify_cover.png"
			return "{\"artist\":\"" & sArtist & "\", \"song\":\"" & sName & "\", \"state\":\"" & sState & "\", \"duration\":\"" & sDuration & "\",  \"time\":\"" & sTime & "\", \"cover\":\"" & (POSIX path of fileName as text) & "\" }"
			return nowPlaying
		else
			return "Paused"
		end if
	end tell
else
	return ""
end if