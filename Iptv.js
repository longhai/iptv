 // Function to fetch the m3u file and display channels
        function loadChannels() {
            const m3uUrl = document.getElementById('m3uUrl').value;
            fetch(m3uUrl)
                .then(response => response.text())
                .then(data => {
                    processM3UData(data);
                })
                .catch(error => console.error('Error loading channels:', error));
        }

        // Function to load channels from a file
        function loadChannelsFromFile() {
            const fileInput = document.getElementById('m3uFile');
            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = function (event) {
                const m3uData = event.target.result;
                processM3UData(m3uData);
            };

            reader.readAsText(file);
        }

        // Function to process M3U data
        function processM3UData(m3uData) {
            const lines = m3uData.split('\n');
            let channelListSelect = document.getElementById('channelList');
            let channelCategorySelect = document.getElementById('channelCategory');
            let categories = new Set();
            let channelsByCategory = {};

            // Keep the "Tất cả" option in the select menu
            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.textContent = 'Tất cả';
            channelCategorySelect.innerHTML = '';
            channelCategorySelect.appendChild(allOption);

            let currentCategory = 'all'; // Store the current category

            lines.forEach(line => {
                if (line.startsWith('#EXTINF:')) {
                    const channelName = line.substring(line.indexOf(',') + 1);
                    const channelUrl = lines[lines.indexOf(line) + 1];
                    let channelLogo = ''; // Store the channel logo

                    // Get the category and logo from the line if available
                    const categoryStartIndex = line.indexOf('group-title="');
                    const logoStartIndex = line.indexOf('tvg-logo="');
                    if (categoryStartIndex !== -1) {
                        const categoryEndIndex = line.indexOf('"', categoryStartIndex + 13);
                        if (categoryEndIndex !== -1) {
                            currentCategory = line.substring(categoryStartIndex + 13, categoryEndIndex);
                            categories.add(currentCategory);
                        }
                    }

                    if (logoStartIndex !== -1) {
                        const logoEndIndex = line.indexOf('"', logoStartIndex + 10);
                        if (logoEndIndex !== -1) {
                            channelLogo = line.substring(logoStartIndex + 10, logoEndIndex);
                        }
                    }

                    if (!channelsByCategory[currentCategory]) {
                        channelsByCategory[currentCategory] = [];
                    }

                    channelsByCategory[currentCategory].push({ name: channelName, url: channelUrl, logo: channelLogo });
                }
            });

            // Populate the channel category select menu
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                channelCategorySelect.appendChild(option);
            });

            // Event listener for channel category selection
            channelCategorySelect.addEventListener('input', filterChannels);

            // Event listener for channel selection
            channelListSelect.addEventListener('change', updateVideoPlayerAndLogo);

            // Store the channels by category in the channel ListSelect for filtering
channelListSelect.channelsByCategory = channelsByCategory;

        // Display all channels by default
        filterChannels();
    }

    // Function to filter channels by category
    function filterChannels() {
        const selectedCategory = document.getElementById('channelCategory').value;
        const channelListSelect = document.getElementById('channelList');
        const channels = channelListSelect.channelsByCategory[selectedCategory] || channelListSelect.channelsByCategory['all'];

        channelListSelect.innerHTML = ''; // Clear the current list

        if (selectedCategory === 'all') {
            Object.values(channelListSelect.channelsByCategory).forEach(categoryChannels => {
                categoryChannels.forEach(channel => {
                    const option = document.createElement('option');
                    option.value = channel.url;
                    option.textContent = channel.name;
                    option.dataset.logo = channel.logo; // Store logo URL in the dataset
                    channelListSelect.appendChild(option);
                });
            });
        } else {
            channels.forEach(channel => {
                const option = document.createElement('option');
                option.value = channel.url;
                option.textContent = channel.name;
                option.dataset.logo = channel.logo; // Store logo URL in the dataset
                channelListSelect.appendChild(option);
            });
        }

        // Update the video player source and logo when a channel is selected
        updateVideoPlayerAndLogo();
    }

    // Function to update the video player source and logo when a channel is selected
    function updateVideoPlayerAndLogo() {
        const videoPlayer = document.getElementById('videoPlayer');
        const channelListSelect = document.getElementById('channelList');
        const channelLogo = document.getElementById('channelLogo');
        const selectedChannelUrl = channelListSelect.value;
        const selectedChannel = channelListSelect.options[channelListSelect.selectedIndex];
        const selectedChannelLogo = selectedChannel.dataset.logo;

        videoPlayer.src = selectedChannelUrl;
        videoPlayer.load();

        if (selectedChannelLogo) {
            channelLogo.src = selectedChannelLogo;
        } else {
            // If no logo is available, show a default image
            showDefaultLogo();
        }
    }

    // Function to show a default logo when no logo is available
    function showDefaultLogo() {
        const channelLogo = document.getElementById('channelLogo');
        // Replace 'your_default_logo_url' with the URL of your default logo image
        channelLogo.src = 'your_default_logo_url';
    }

    // Call the function to load channels when the page is ready
    document.addEventListener('DOMContentLoaded', loadChannels);
