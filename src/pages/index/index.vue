<template>
	<div class="home">
		<!-- Fixed Header Area -->
		<div class="fixed-header-container">
			<div class="match-header">
				<div class="team-logo home-logo"></div> <!-- Placeholder for logo -->
				<div class="team-name home-team">{{ homeTeam }}</div>
				<div class="vs">VS</div>
				<div class="team-name away-team">{{ awayTeam }}</div>
				<div class="team-logo away-logo"></div> <!-- Placeholder for logo -->
			</div>
			<div class="controls-time-container">
				<!-- Control Buttons -->
				<div class="control-panel">
					<button :disabled="isPolling" @click="startPolling" class="control-btn start">
						<span class="icon">▶</span> 开始刷新
					</button>
					<button :disabled="!isPolling" @click="stopPolling" class="control-btn stop">
						<span class="icon">■</span> 停止刷新
					</button>
				</div>
				<!-- Current Time Display -->
				<div class="time-display">
					当前时间: {{ currentTime }}
				</div>
			</div>
		</div>

		<!-- Scrollable Content Area -->
		<div class="content-container">
			<div class="scrollable-content">
				<section-item v-for="section in seatSections" :key="section.title" :section="section" />
				<!-- Membership Mask (keep commented or implement as needed) -->
				<!-- <div v-if="!isMember" class="membership-mask"> ... </div> -->
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { fetchCurrentMatch, fetchMatchData, fetchBlockInfo, type Match, type MatchData, type SeatSection, type BlockInfoHistory } from '@/api/request'
import SectionItem from '@/components/SectionItem.vue'
import { computed, onMounted, onUnmounted, ref } from 'vue' // Import onUnmounted

// --- User Info (Membership - keep as is or implement fully) ---
const userInfo = ref({ isMember: false })
const checkMembership = () => {
	try {
		const cached = uni.getStorageSync('userInfo')
		if (cached) { userInfo.value = cached }
	} catch (e) { console.log('本地缓存读取失败:', e) }
}
const isMember = computed(() => userInfo.value.isMember)
// --- End User Info ---

// --- Match Data ---
const homeTeam = ref('主队加载中...')
const awayTeam = ref('客队加载中...')
const seatSections = ref<SeatSection[]>([])
const matchId = ref('')
// --- End Match Data ---

// --- Polling ---
const pollingInterval = ref<number | null>(null)
const isPolling = ref(false)

const updateBlockInfo = async () => {
	if (!matchId.value) return; // Don't fetch if matchId isn't set yet
	try {
		const blockData = await fetchBlockInfo(matchId.value);
		const blockInfoMap = blockData.reduce((acc, block) => {
			acc[block.blockName] = block;
			return acc;
		}, {} as Record<string, BlockInfoHistory>);

		seatSections.value = seatSections.value.map(section => ({
			...section,
			positions: section.positions.map(position => {
				return {
				...position,
				// Use optional chaining and nullish coalescing for safety
				refundCount: blockInfoMap[position.name]?.occurrences ?? position.refundCount ?? 0
			}
			})
		}));
		console.log('区块信息已更新:', new Date().toLocaleTimeString()); // Log update time
	} catch (error) {
		console.error('更新区块信息失败:', error);
		// Maybe stop polling on error? Or show a message?
		// stopPolling(); // Optional: Stop polling if an update fails
	}
}

const startPolling = () => {
	if (isPolling.value) return;
	console.log('开始轮询...');
	isPolling.value = true;
	updateBlockInfo(); // Immediate update
	pollingInterval.value = setInterval(updateBlockInfo, 3000) as unknown as number; // Increased interval to 3s
}

const stopPolling = () => {
	if (pollingInterval.value !== null) {
		clearInterval(pollingInterval.value);
		pollingInterval.value = null;
	}
	isPolling.value = false;
	console.log('停止轮询.');
}
// --- End Polling ---

// --- Current Time ---
const currentTime = ref('')
const timeUpdaterInterval = ref<number | null>(null)

const updateTime = () => {
	const now = new Date();
	currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false });
}
// --- End Current Time ---

// --- Lifecycle Hooks ---
onMounted(async () => {
	checkMembership(); // Check membership status on mount

	// Start updating time immediately
	updateTime();
	timeUpdaterInterval.value = setInterval(updateTime, 1000) as unknown as number;

	console.log("onMounted: 开始获取比赛数据...");
	try {
		const match = await fetchCurrentMatch();
		matchId.value = match.matchId;
		console.log("onMounted: 获取到 Match ID:", matchId.value);

		const matchData = await fetchMatchData(match.matchId);
		homeTeam.value = matchData.homeTeam;
		awayTeam.value = matchData.awayTeam;
		// Initialize sections with refundCount 0 or from fetched data if available immediately
		seatSections.value = matchData.seatSections.map(section => ({
			...section,
			positions: section.positions.map(pos => ({ ...pos, refundCount: 0 })) // Default to 0 initially
		}));
		console.log("onMounted: 比赛基础数据加载完成.");

		// Fetch initial block info after getting sections
		await updateBlockInfo(); // Fetch initial block info

		// Optional: Auto-start polling if desired
		// startPolling();

	} catch (error) {
		console.error('onMounted: 获取比赛数据失败:', error);
		homeTeam.value = '加载失败';
		awayTeam.value = '加载失败';
		// You might want to display an error message to the user here
	}
});

onUnmounted(() => {
	console.log("onUnmounted: 清理定时器...");
	// Clear polling interval
	if (pollingInterval.value !== null) {
		clearInterval(pollingInterval.value);
		pollingInterval.value = null;
	}
	// Clear time update interval
	if (timeUpdaterInterval.value !== null) {
		clearInterval(timeUpdaterInterval.value);
		timeUpdaterInterval.value = null;
	}
});
// --- End Lifecycle Hooks ---

// --- Methods (Example for Membership Button) ---
const handleOpenMember = () => {
	// Navigate to membership page or show modal
	console.log('立即开通会员');
	uni.showToast({ title: '跳转到开通会员页面...', icon: 'none' });
	// Example navigation:
	// uni.navigateTo({ url: '/pages/membership/membership' });
}
// --- End Methods ---

</script>

<style lang="scss" scoped>
/* Global box sizing */
* {
	box-sizing: border-box;
}

.home {
	display: flex;
	flex-direction: column;
	height: 100%; // Make sure the home container takes full viewport height
	background-color: #f4f7f6; // Softer background color
}

.fixed-header-container {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	z-index: 1000; // Ensure it's above everything else
	background-color: #ffffff; // Solid background for the container
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); // Softer shadow
}

.match-header {
	display: flex;
	justify-content: space-around; // Better distribution
	align-items: center;
	padding: 15px 10px; // Adjust padding
	font-size: 18px; // Slightly larger base font
	font-weight: 600; // Bolder
	// background: linear-gradient(to bottom, #ffffff, #f9f9f9); // Subtle gradient
	border-bottom: 1px solid #eee; // Separator line

	.team-name {
		flex: 1; // Allow names to take space
		text-align: center; // Center names
		color: #333;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis; // Handle long names
	}

	.home-team {
		text-align: right;
		padding-right: 10px;
	}

	.away-team {
		text-align: left;
		padding-left: 10px;
	}

	.vs {
		color: #e74c3c; // Use a theme color for VS
		font-weight: 700;
		padding: 0 10px;
		flex-shrink: 0; // Prevent VS from shrinking
	}

	// Optional placeholder for team logos
	.team-logo {
		width: 24px;
		height: 24px;
		background-color: #ccc; // Placeholder color
		border-radius: 50%;
		// Add background-image: url(...) when you have logos
		flex-shrink: 0; // Prevent logos from shrinking
	}

	.home-logo {
		margin-right: 8px;
	}

	.away-logo {
		margin-left: 8px;
	}
}

.controls-time-container {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px 15px; // Padding for this section
	background-color: #fdfdfd; // Slightly different bg
	border-bottom: 1px solid #eee; // Separator line
}

.control-panel {
	display: flex;
	gap: 10px; // Space between buttons
}

.control-btn {
	display: flex; // Align icon and text
	align-items: center; // Center vertically
	gap: 5px; // Space between icon and text
	padding: 6px 12px; // Slightly smaller padding
	border-radius: 15px; // More rounded buttons
	border: none;
	cursor: pointer;
	font-size: 13px; // Slightly smaller font
	font-weight: 500;
	transition: background-color 0.2s ease, transform 0.1s ease; // Smooth transitions

	.icon {
		font-size: 10px; // Smaller icon size
	}

	&.start {
		background-color: #2ecc71; // Brighter green
		color: white;

		&:hover:not(:disabled) {
			background-color: #27ae60; // Darker green on hover
		}

		&:active:not(:disabled) {
			transform: scale(0.98); // Press effect
		}

		&:disabled {
			background-color: #b8e9c1; // Lighter disabled green
			cursor: not-allowed;
			color: #f0f0f0;
		}
	}

	&.stop {
		background-color: #e74c3c; // Red
		color: white;

		&:hover:not(:disabled) {
			background-color: #c0392b; // Darker red on hover
		}

		&:active:not(:disabled) {
			transform: scale(0.98); // Press effect
		}

		&:disabled {
			background-color: #f5b7b1; // Lighter disabled red
			cursor: not-allowed;
			color: #f0f0f0;
		}
	}
}

.time-display {
	font-size: 13px;
	color: #555; // Dark gray color
	font-weight: 500;
}

// Adjust the scrollable content's top padding dynamically or use a fixed value
// that is guaranteed to be larger than the combined height of the fixed elements.
// You might need to inspect the element height in devtools to get an accurate value.
$fixed-header-height: 30px; // Approximate height of match header
$controls-time-height: 40px; // Approximate height of controls/time bar
$total-fixed-height: $fixed-header-height + $controls-time-height + 10px; // Add some buffer

$tabbar-height: 50px; // !!! 替换为你的实际 Tabbar 高度 !!!
$bottom-buffer: 10px; // 可以加一点缓冲距离

.content-container {
	flex: 1; // Take remaining space
	position: relative; // Needed for the mask if used
	padding-top: $total-fixed-height; // PUSH CONTENT DOWN
	// padding-bottom: calc($tabbar-height + $bottom-buffer); // <--- 新增：为底部 Tabbar 留出空间
	overflow: hidden; // Prevent margin collapse issues
}

.scrollable-content {
	height: 100%; // Fill the container
	overflow-y: auto; // Enable vertical scrolling ONLY here
	background-color: #f4f7f6; // Match home background
	padding-top: 15px;
	padding-left: 15px;
	padding-right: 15px;
	padding-bottom: 0;
	/* <--- 将底部内边距设为 0 */
	-webkit-overflow-scrolling: touch; // Smooth scrolling on iOS
}

// --- Membership Mask Styles (keep as is or customize) ---
.membership-mask {
	position: absolute;
	top: 0; // Relative to content-container
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.75); // Slightly darker mask
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1001; // Above content, below header? Or above header? Adjust as needed.
}

.mask-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 30rpx 40rpx;
	background: #fff;
	border-radius: 16rpx;
	width: 80%;
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.mask-text {
	font-size: 32rpx;
	color: #333;
	margin-bottom: 40rpx; // More space
	text-align: center;
}

.open-btn {
	background: linear-gradient(to right, #07c160, #04a953); // Gradient button
	color: white;
	padding: 20rpx 50rpx; // Adjust padding
	border-radius: 50rpx;
	font-size: 28rpx;
	font-weight: bold;
	border: none;
	box-shadow: 0 2px 5px rgba(0, 150, 80, 0.3);
	transition: background 0.3s ease;

	&:active {
		background: linear-gradient(to right, #06a852, #038e45); // Darker gradient on press
		transform: scale(0.98);
	}

	&::after {
		border: none;
	}
}
</style>