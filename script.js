const clientId = 'e538b3c9a9ac472ba4f604de3c10b641';
const redirectUri = 'https://worldradio.netlify.app/callback';
const playlistId = 'YOUR_PLAYLIST_ID';
let player, accessToken;

function authorize() {
    const scopes = 'streaming user-read-email user-read-private';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}`;
    window.location.href = authUrl;
}

window.onSpotifyWebPlaybackSDKReady = () => {
    player = new Spotify.Player({
        name: 'My Radio Player',
        getOAuthToken: cb => { cb(accessToken); }
    });

    player.addListener('ready', ({ device_id }) => {
        console.log('Player is ready');
        playPlaylist(device_id);
    });

    player.connect();
};

function playPlaylist(deviceId) {
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "context_uri": `spotify:playlist:${playlistId}` })
    });
}

document.getElementById('play-pause').addEventListener('click', () => {
    if (!accessToken) {
        authorize();
    } else {
        player.togglePlay();
    }
});

document.getElementById('volume').addEventListener('input', (e) => {
    player.setVolume(e.target.value);
});

// Extract the access token from URL after authentication
window.onload = function() {
    const params = new URLSearchParams(window.location.hash.replace('#', '?'));
    accessToken = params.get('access_token');
    if (accessToken) {
        window.history.replaceState({}, document.title, "/"); // remove token from URL
    }
}
