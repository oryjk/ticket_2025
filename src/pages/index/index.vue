<template>
	<div class="home">
		<div class="match-header">
			<div class="team-name">{{ homeTeam }}</div>
			<div class="vs">VS</div>
			<div class="team-name">{{ awayTeam }}</div>
		</div>

		<!-- 添加蒙层容器 -->
		<div class="content-container">
			<div class="scrollable-content">
				<section-item v-for="section in seatSections" :key="section.title" :section="section" />
				<!-- 会员蒙层 -->
				<div v-if="!isMember" class="membership-mask">
					<div class="mask-content">
						<text class="mask-text">开通会员享受完整服务</text>
						<button class="open-btn" @click="handleOpenMember">立即开通</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { ref, onMounted, computed } from 'vue'
	import { fetchMatchData, type SeatSection } from '@/api/request'
	import SectionItem from '@/components/SectionItem.vue'

	// 新增用户信息相关
	const userInfo = ref({
		isMember: false
	})
	// 从本地存储获取用户信息
	const checkMembership = () => {
		try {
			const cached = uni.getStorageSync('userInfo')
			if (cached) {
				userInfo.value = cached
			}
		} catch (e) {
			console.log('本地缓存读取失败:', e)
		}
	}
	// 计算属性判断会员状态
	const isMember = computed(() => userInfo.value.isMember)

	const homeTeam = ref('')
	const awayTeam = ref('')
	const seatSections = ref<SeatSection[]>([])

	onMounted(async () => {
		try {
			// 初始化检查会员状态
			checkMembership()

			console.log("on mount 执行了没有 ")
			const data = await fetchMatchData()
			homeTeam.value = data.homeTeam
			awayTeam.value = data.awayTeam
			seatSections.value = data.seatSections
		} catch (error) {
			console.error('获取比赛数据失败:', error)
		}
	})
</script>

<style lang="scss" scoped>
	.home {
		display: flex;
		flex-direction: column;
		padding: 0;
		/* height: 100vh; */
		/* height: 1200px; */
	}

	.match-header {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20px;
		font-size: 18px;
		font-weight: bold;
		background-color: #fff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		position: fixed;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 90%;
		z-index: 100;
		color: #666;
	}

	.scrollable-content {
		flex: 1;
		overflow-y: scroll;
		background-color: #f8f8f8;
		margin-top: 67px;
		position: relative; // 新增定位
		/* height:550px; */
		/* padding-bottom: 370px; */
	}

	.team-name {
		margin: 0 20px;
	}

	.content-container {
		position: relative;
		flex: 1;
	}

	.membership-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 100;
	}

	.mask-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 30rpx;
		background: #fff;
		border-radius: 16rpx;
		width: 80%;
	}

	.mask-text {
		font-size: 32rpx;
		color: #333;
		margin-bottom: 30rpx;
		text-align: center;
	}

	.open-btn {
		background: #07c160;
		color: white;
		padding: 20rpx 40rpx;
		border-radius: 50rpx;
		font-size: 28rpx;

		&::after {
			border: none;
		}
	}
</style>