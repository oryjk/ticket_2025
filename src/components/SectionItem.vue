<template>
	<div class="content-item">
		<div class="section-title" :style="{ backgroundColor: section.color }">
			<div class="title-text" :style="{ color: isDarkColor(section.color) ? '#fff' : '#000' }">{{ section.title }}
			</div>
			<div class="price-text" :style="{ color: isDarkColor(section.color) ? '#fff' : '#000' }">
				票价：{{ section.price }}元</div>
		</div>
		<div class="positions-grid">
			<div class="position-item" v-for="position in section.positions" :key="position.name"
				:style="{ backgroundColor: section.color, color: isDarkColor(section.color) ? '#fff' : '#333' }">
				<div class="position-name">{{ position.name }}</div>
				<div class="ticket-count" :class="{ 'has-refund': position.refundCount > 0 }">累计退票次数:
					{{ position.refundCount }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { SeatSection } from '../api/request'

	defineProps<{
		section : SeatSection
	}>()

	const isDarkColor = (color : string) => {
		const hex = color.replace('#', '')
		const r = parseInt(hex.slice(0, 2), 16)
		const g = parseInt(hex.slice(2, 4), 16)
		const b = parseInt(hex.slice(4, 6), 16)

		const brightness = (r * 299 + g * 587 + b * 114) / 1000
		return brightness < 128
	}
</script>

<style scoped>
	.content-item {
		background-color: #ffffff;
		padding: 0;
		margin-bottom: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		margin: 10px;

	}

	.section-title {
		background-color: #f0f0f0;
		padding: 2px;
		border-bottom: 1px solid #e0e0e0;
		font-weight: 600;
		text-align: center;
	}

	.title-text {
		font-size: 16px;
		font-weight: bold;
		color: #333;
		margin-bottom: 4px;
	}

	.price-text {
		font-size: 14px;
		color: #666;
	}

	.positions-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 1px;
		padding: 1px;
	}

	.position-item {
		flex: 1 1 calc(20% - 4px);
		min-width: 85px;
		max-width: calc(20% - 4px);
		border-radius: 6px;
		text-align: center;
		transition: background-color 0.3s ease;
	}

	.position-name {
		font-size: 14px;
	}

	.ticket-count {
		font-size: 12px;
		color: #fff;
		padding: 2px 4px;
	}

	.ticket-count.has-refund {
		color: #fff;
		background-color: #f51606;
	}
</style>