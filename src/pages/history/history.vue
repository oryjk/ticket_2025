<template>
	<view class="list">
		<view class="match-content" v-if="selectedMatch">
			<view class="match-select">
				<uni-data-select v-model="selectedMatch" :localdata="matchOptions"
					@change="handleMatchChange"></uni-data-select>
			</view>
			<view class="match-header">

				<view class="team-name">{{ homeTeam }}</view>
				<view class="vs">VS</view>
				<view class="team-name">{{ awayTeam }}</view>
			</view>
			<view class="scrollable-content">
				<section-item v-for="section in seatSections" :key="section.title" :section="section" />
			</view>
		</view>
	</view>
</template>
<script setup lang="ts">
	import { ref, onMounted } from 'vue'
	import { fetchMatchData, type SeatSection } from '../../api/request'
	import SectionItem from '../../components/SectionItem.vue'

	interface MatchOption {
		text : string
		value : string
	}

	const matchOptions = ref<MatchOption[]>([])
	const selectedMatch = ref('match1')
	const homeTeam = ref('')
	const awayTeam = ref('')
	const seatSections = ref<SeatSection[]>([])

	// 模拟获取历史比赛列表
	const fetchHistoryMatches = async () => {
		// 这里应该调用实际的API
		return [
			{ text: '2024-03-01 主队 vs 客队A', value: 'match1' },
			{ text: '2024-02-28 主队 vs 客队B', value: 'match2' },
			{ text: '2024-02-25 主队 vs 客队C', value: 'match3' },
			{ text: '2024-03-01 主队 vs 客队A', value: 'match1' },
			{ text: '2024-02-28 主队 vs 客队B', value: 'match2' },
			{ text: '2024-02-25 主队 vs 客队C', value: 'match3' },
			{ text: '2024-03-01 主队 vs 客队A', value: 'match1' },
			{ text: '2024-02-28 主队 vs 客队B', value: 'match2' },
			{ text: '2024-02-25 主队 vs 客队C', value: 'match3' },
			{ text: '2024-03-01 主队 vs 客队A', value: 'match1' },
			{ text: '2024-02-28 主队 vs 客队B', value: 'match2' },
			{ text: '2024-02-25 主队 vs 客队C', value: 'match3' }
		]
	}

	const handleMatchChange = async (value : string) => {
		if (value) {
			try {
				console.log("handleMatchChange 执行了没有 " + value)
				const data = await fetchMatchData(value)
				homeTeam.value = data.homeTeam
				awayTeam.value = data.awayTeam
				seatSections.value = data.seatSections
			} catch (error) {
				console.error('获取比赛数据失败:', error)
			}
		}
	}


	onMounted(async () => {
		try {
			matchOptions.value = await fetchHistoryMatches()
			if (matchOptions.value.length > 0) {
				selectedMatch.value = matchOptions.value[0].value
				await handleMatchChange(selectedMatch.value)
			}
		} catch (error) {
			console.error('获取历史比赛列表失败:', error)
		}
	})
</script>

<style lang="scss" scoped>
	.list {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 0;
		width: 100%;

		.match-content {
			display: flex;
			flex-direction: column;
			padding: 0;
			background-color: #f8f8f8;
			/* margin-top: 104px; */
			padding-top: 104px;

			.match-select {
				display: flex;
				justify-content: center;
				text-align: center;
				position: fixed;
				width: 100%;
				top: 0;
				z-index: 101;
				box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
				background-color: #fff;

				uni-data-select {
					width: 100%;
				}

			}

			.match-header {
				display: flex;
				justify-content: center;
				align-items: center;
				position: fixed;
				padding: 20px;
				font-size: 18px;
				font-weight: bold;
				background-color: #fff;
				box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
				color: #666;

				top: 35px;
				left: 0;
				right: 0;
				z-index: 100;

				.team-name {
					margin: 0 20px;
				}
			}

			.scrollable-content {
				flex: 1;
				overflow-y: auto;
				background-color: #f8f8f8;

			}
		}
	}
</style>