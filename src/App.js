import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import axios from 'axios'
import './App.css'

function Heatmap() {
    const svgRef = useRef()

    useEffect(() => {
        let margin = { top: 30, right: 100, bottom: 30, left: 100 }
        let width = 600
        let height = 600

        const svg = d3
            .select(svgRef.current)
            .attr('viewBox', [0, 0, width + 150, height + 100])
            .attr('position', 'relative')

        axios({
            method: 'GET',
            url:
                'https://nmsvtx50zd.execute-api.ap-northeast-2.amazonaws.com/beta/cohort/repurchase',
            params: {
                freq: 'monthly',
                dimensions: 'm',
                measures: 'retention',
            },
        }).then((data) => {
            console.log('axios data: ', data)

            let newDimensions = []

            for (let i = 1; i < data.data.data.dimensions.length; i++) {
                newDimensions.push(data.data.data.dimensions[i])
            }

            data.data.index = data.data.index.reverse()
            data.data.data.measures[0] = data.data.data.measures[0].reverse()

            let newMeasures = []

            for (let i = 0; i < data.data.data.measures[0].length; i++) {
                for (let j = 1; j < data.data.data.measures[0][i].length; j++) {
                    if (data.data.data.measures[0][i][j] === null) {
                        data.data.data.measures[0][i][j] = 0
                    }

                    let object = {
                        x_axis: data.data.data.dimensions[j],
                        y_axis: data.data.index[i],
                        value: data.data.data.measures[0][i][j],
                    }

                    newMeasures.push(object)
                }
            }

            const xAxis = newDimensions
            const yAxis = data.data.index

            const xScale = d3
                .scaleBand()
                .range([0, width])
                .domain(xAxis)
                .padding(0.02)

            const yScale = d3
                .scaleBand()
                .range([height, 0])
                .domain(yAxis)
                .padding(0.02)

            const xHeight = 640

            svg.append('g')
                .style('font-size', 15)
                .attr('transform', 'translate(' + 110 + ',' + xHeight + ')')
                .call(d3.axisBottom(xScale).tickSize(0))
                .select('.domain')
                .remove()

            svg.append('g')
                .style('font-size', 15)
                .call(d3.axisLeft(yScale).tickSize(0))
                .attr('transform', 'translate(' + 100 + ',' + margin.top + ')')
                .select('.domain')
                .remove()

            let beforeColor = newMeasures.flatMap((x) => x.value)

            // const myColor = d3
            //     .scaleSequential()
            //     .domain([0, d3.max(newMeasures2)])
            //     .interpolator(d3.interpolateRainbow)

            var myColor = d3
                .scaleLinear()
                .domain([d3.min(beforeColor), d3.max(beforeColor)])
                .range(['white', 'blue'])

            const tooltip = d3
                .selectAll('body')
                .append('div')
                .style('opacity', 0)
                .attr('class', 'tooltip')
                .style('position', 'absolute')
                .style('z-index', 10)
                .style('background-color', 'white')
                .style('border', 'solid')
                .style('border-width', '2px')
                .style('border-radius', '5px')
                .style('padding', '5px')

            svg.selectAll('rect')
                .data(newMeasures)
                .enter()
                .append('rect')
                .attr('x', function (d, index) {
                    return xScale(d.x_axis)
                })
                .attr('y', function (d, i) {
                    return yScale(d.y_axis)
                })
                .attr('rx', 4)
                .attr('ry', 4)
                .attr('width', xScale.bandwidth())
                .attr('height', yScale.bandwidth())
                .style('fill', function (d, index) {
                    return myColor(d.value)
                })
                .style('stroke-width', 4)
                .style('stroke', 'none')
                .style('opacity', 0.8)
                .attr(
                    'transform',
                    'translate(' + 110 + ',' + margin.bottom + ')'
                )
                .on('mouseover', function (d, i) {
                    if (i.value === null) {
                        i.value = 0
                    }
                    tooltip
                        .html('The exact value of<br>this cell is: ' + i.value)
                        .style('opacity', 1)

                    d3.select(this).style('stroke', 'block').style('opacity', 1)
                })
                .on('mousemove', function (d, i) {
                    tooltip
                        .style('left', d.pageX + 20 + 'px')
                        .style('top', d.pageY + 'px')
                })
                .on('mouseleave', function (d) {
                    tooltip.style('opacity', 0)
                    d3.select(this)
                        .style('stroke', 'none')
                        .style('opacity', 0.8)
                })

            console.log(newMeasures)

            // svg.selectAll('text')
            //     .data(newMeasures)
            //     .enter()
            //     .append('text')
            //     .text(function (d) {
            //         console.log(d.value)
            //         return d.value
            //     })
            //     .attr('transform', 'translate(' + 116 + ',' + 45 + ')')
            //     .attr('x', function (d, index) {
            //         return xScale(d.x_axis)
            //     })
            //     .attr('y', function (d, i) {
            //         return yScale(d.y_axis)
            //     })
            //     .attr('font-size', '7')

            // Add title to graph
            // svg.append('text')
            //     .attr('x', 0)
            //     .attr('y', -50)
            //     .attr('text-anchor', 'left')
            //     .style('font-size', '22px')
            // .text('A d3.js heatmap')

            // Add subtitle to graph
            // svg.append('text')
            //     .attr('x', 0)
            //     .attr('y', -20)
            //     .attr('text-anchor', 'left')
            //     .style('font-size', '14px')
            //     .style('fill', 'grey')
            //     .style('max-width', 400)
            // .text(
            //     'A short description of the take-away message of this chart.'
            // )
        })

        // ----------------------------------------

        // d3.csv(
        //     'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv'
        // ).then((data) => {
        //   var myGroups = d3.map(data, (d) => {
        //     return d.group
        // })
        // var myVars = d3.map(data, (d) => {
        //     return d.variable
        // })

        // const xScale = d3
        //     .scaleBand()
        //     .range([0, width - 70])
        //     .domain(myGroups)
        //     .padding(0.02)

        // const yScale = d3
        //     .scaleBand()
        //     .range([height - 30, 0])
        //     .domain(myVars)
        //     .padding(0.02)

        // const xHeight = height + 10

        // svg.append('g')
        //     .style('font-size', 15)
        //     .attr('transform', 'translate(' + 40 + ',' + xHeight + ')')
        //     .call(d3.axisBottom(xScale).tickSize(0))
        //     .select('.domain')
        //     .remove()

        // svg.append('g')
        //     .style('font-size', 15)
        //     .call(d3.axisLeft(yScale).tickSize(0))
        //     .attr('transform', 'translate(' + 30 + ',' + margin.top + ')')
        //     .select('.domain')
        //     .remove()

        // const myColor = d3
        //     .scaleSequential()
        //     .interpolator(d3.interpolateRainbow)
        //     .domain([1, 100])

        // const tooltip = d3
        //     .selectAll('body')
        //     .append('div')
        //     .style('opacity', 0)
        //     .attr('class', 'tooltip')
        //     .style('position', 'absolute')
        //     .style('z-index', 10)
        //     .style('background-color', 'white')
        //     .style('border', 'solid')
        //     .style('border-width', '2px')
        //     .style('border-radius', '5px')
        //     .style('padding', '5px')

        // svg.selectAll('rect')
        //     .data(data, function (d) {
        //         return d.group + ':' + d.variable
        //     })
        //     .enter()
        //     .append('rect')
        //     .attr('x', function (d) {
        //         return xScale(d.group)
        //     })
        //     .attr('y', function (d) {
        //         return yScale(d.variable)
        //     })
        //     .attr('rx', 4)
        //     .attr('ry', 4)
        //     .attr('width', xScale.bandwidth())
        //     .attr('height', yScale.bandwidth())
        //     .style('fill', function (d) {
        //         return myColor(d.value)
        //     })
        //     .style('stroke-width', 4)
        //     .style('stroke', 'none')
        //     .style('opacity', 0.8)
        //     .attr(
        //         'transform',
        //         'translate(' + 40 + ',' + margin.bottom + ')'
        //     )
        //     .on('mouseover', function (d, i) {
        //         tooltip
        //             .html('The exact value of<br>this cell is: ' + i.value)
        //             .style('opacity', 1)

        //         d3.select(this).style('stroke', 'block').style('opacity', 1)
        //     })
        //     .on('mousemove', function (d, i) {
        //         tooltip
        //             .style('left', d.pageX + 20 + 'px')
        //             .style('top', d.pageY + 'px')
        //     })
        //     .on('mouseleave', function (d) {
        //         tooltip.style('opacity', 0)
        //         d3.select(this)
        //             .style('stroke', 'none')
        //             .style('opacity', 0.8)
        //     })

        // // Add title to graph
        // svg.append('text')
        //     .attr('x', 0)
        //     .attr('y', -50)
        //     .attr('text-anchor', 'left')
        //     .style('font-size', '22px')
        //     .text('A d3.js heatmap')

        // // Add subtitle to graph
        // svg.append('text')
        //     .attr('x', 0)
        //     .attr('y', -20)
        //     .attr('text-anchor', 'left')
        //     .style('font-size', '14px')
        //     .style('fill', 'grey')
        //     .style('max-width', 400)
        //     .text(
        //         'A short description of the take-away message of this chart.'
        //     )
        // })
    }, [])

    return (
        <div className="App">
            <h1>Heatmap</h1>
            <svg ref={svgRef}></svg>
        </div>
    )
}

export default Heatmap
