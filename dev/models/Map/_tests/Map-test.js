'use strict'
const chai = require('chai')
const expect = chai.expect

const Map_ = require('../Map')
const Waypoint = require('../../Waypoint/Waypoint')
const WaypointCollection = require('../../Waypoint/WaypointCollection')
const _DOMParser = require('xmldom').DOMParser

describe('Map', function() {

  describe('init with defaults', function() {
    let data = {
      destinationLabels: [],
      map: {
        defaultMapForDevice: false,
        description: '',
        floorSequence: null,
        locationId: null,
        locationName: '',
        mapId: null,
        name: '',
        parentLocationId: null,
        preference: null,
        status: null,
        statusDesc: '',
        svgMap: '',
        thumbnailHTML: '',
        uri: '',
        xOffset: null,
        xScale: null,
        yOffset: null,
        yScale: null,
      },
      mapLabels: [],
      svg: '',
      WaypointCollection: null
    }

    let loc = new Map_({})

    it('should give default values', function() {
      expect(loc.defaultMapForDevice).to.eql(data.map.defaultMapForDevice)
      expect(loc.description).to.eql(data.map.description)
      expect(loc.floorSequence).to.eql(data.map.floorSequence)
      expect(loc.locationId).to.eql(data.map.locationId)
      expect(loc.locationName).to.eql(data.map.locationName)
      expect(loc.mapId).to.eql(data.map.mapId)
      expect(loc.name).to.eql(data.map.name)
      expect(loc.parentLocationId).to.eql(data.map.parentLocationId)
      expect(loc.preference).to.eql(data.map.preference)
      expect(loc.status).to.eql(data.map.status)
      expect(loc.statusDesc).to.eql(data.map.statusDesc)
      expect(loc.svgMap).to.eql(data.map.svgMap)
      expect(loc.thumbnailHTML).to.eql(data.map.thumbnailHTML)
      expect(loc.uri).to.eql(data.map.uri)
      expect(loc.xOffset).to.eql(data.map.xOffset)
      expect(loc.xScale).to.eql(data.map.xScale)
      expect(loc.yOffset).to.eql(data.map.yOffset)
      expect(loc.yScale).to.eql(data.map.yScale)
      expect(loc.svg).to.eql(data.svg)
      expect(loc.WaypointCollection).to.eql(data.WaypointCollection)

      // expect(loc.mapLabels).to.eql(data.mapLabels)
      // expect(loc.destinationLabels).to.eql(data.destinationLabels)
    });

  });

  describe('init with good data', function() {
    let data = {
      destinationLabels: [1, 2, 3],
      map: {
        defaultMapForDevice: false,
        description: 'LC',
        floorSequence: 0,
        locationId: 20,
        locationName: 'Lower Level 1',
        mapId: 126137,
        name: 'Concourse Level',
        parentLocationId: 9,
        preference: 0,
        status: 1,
        statusDesc: 'Active',
        svgMap: '/cms/maps/svg/126137SanFrancisco-Maps_v16_EXTENDED-public_LL1.svg',
        thumbnailHTML: 'hello',
        uri: '/cms/maps/126137SanFrancisco-Maps_v16_EXTENDED-public_LL1.png',
        xOffset: 0,
        xScale: 310.86049,
        yOffset: 0,
        yScale: 310.86049,
      },
      mapLabels: [0],
      svg: '<?xml version="1.0" encoding="utf-8" standalone="no"?><!-- Generator: Adobe Illustrator 18.1.1, SVG Export Plug-In . SVG Version: 6.00 Build 0) --><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="LL1" style="enable-background:new 0 0 5500 5500;" version="1.1" viewBox="0 0 5500 5500" x="0px" xml:space="preserve" y="0px"><style type="text/css">.LBox{fill:none;}.Stairs{fill:#F7E7D0;}.Escalators{fill:#F7E7D0;}.Elevators{fill:#F7E7D0;}.Units{fill:#F7E7D0;}.Streets-Major{fill:none;stroke:#FCFCFC;stroke-width:86;stroke-linejoin:round;stroke-miterlimit:10;}.Streets-Minor{fill:none;stroke:#EAEAEA;stroke-width:34;stroke-linejoin:round;stroke-miterlimit:10;}.Streets-SmallAlleys{fill:none;stroke:#A0A0A0;stroke-width:10;stroke-linejoin:round;stroke-miterlimit:10;}.Mall-Boundary{fill:#678592;}.Background{fill:#C0CECE;}.Restrooms{fill:#B0C979;}.Interior-ParkingLots{fill:#526B72;}</style><g id="Background_15_"><rect class="Background" height="5500" width="5500"/></g><g id="Parking-Lots_1_"></g><g id="Interior-ParkingLots_9_"><polygon class="Interior-ParkingLots" points="2730.372,3301.789 2839.519,3410.542 3436.076,2812.072 3329.581,2702.577 "/></g><g id="Mall-Boundary_1_"><polygon class="Mall-Boundary" points="2417.288,2581.239 2590.243,2414.118 2612.502,2437.516 2668.321,2384.306 2675.903,2391.888 2674.956,2392.835 2986.267,2714.897 3026.769,2675.75 3150.25,2803.625 2791,3150.875 2632,2986 2641.027,2977.604 2579.293,2913.869 2434.764,3053.75 2199.625,2810.492 2268.135,2744.894 2272.5,2749.145 2272.5,2755.135 2287.375,2755.359 2316.656,2727.658 2316.656,2712.756 2318.205,2712.677 2330.709,2700.125 2337.607,2707.125 2441.277,2606.596 "/></g><g id="Streets-SmallAlleys_1_"><line class="Streets-SmallAlleys" x1="814.828" x2="3549.164" y1="5516" y2="2774.142"/><line class="Streets-SmallAlleys" x1="1078.775" x2="2978.624" y1="5556" y2="3641.918"/><line class="Streets-SmallAlleys" x1="-14" x2="1006.595" y1="4120.026" y2="3945.866"/><line class="Streets-SmallAlleys" x1="745.52" x2="1042.782" y1="5244.48" y2="5547.741"/><polyline class="Streets-SmallAlleys" points="769.515,5220.485 442.902,4887.873 2344.576,3004.196 "/><polyline class="Streets-SmallAlleys" points="1486.693,4145.071 2272.536,3364.177 2445.497,3532.144 "/><line class="Streets-SmallAlleys" x1="2401.189" x2="2902.424" y1="3588.811" y2="4096.045"/><line class="Streets-SmallAlleys" x1="2264.666" x2="2753.094" y1="4730.021" y2="5220.485"/><line class="Streets-SmallAlleys" x1="2565.994" x2="1894.305" y1="5414.96" y2="4730.021"/><line class="Streets-SmallAlleys" x1="2386.117" x2="1888.621" y1="5613.728" y2="5103.837"/><polyline class="Streets-SmallAlleys" points="2603.554,4719.906 3673.031,3654.881 3784.234,3544.142 "/><line class="Streets-SmallAlleys" x1="2761.811" x2="4196.83" y1="4867.812" y2="3432.649"/><line class="Streets-SmallAlleys" x1="3814.829" x2="3661.009" y1="3814.689" y2="3666.854"/><path class="Streets-SmallAlleys" d="M3268.056,5374.056l1297.902-1284.024c0,0,88.102-78.374,118.096-144.166"/><line class="Streets-SmallAlleys" x1="3124.085" x2="4534.084" y1="5230.085" y2="3790.092"/><line class="Streets-SmallAlleys" x1="3312.384" x2="3498" y1="4672" y2="4867.812"/><line class="Streets-SmallAlleys" x1="2789.674" x2="3289.984" y1="5192.308" y2="5691.712"/><line class="Streets-SmallAlleys" x1="2664.803" x2="2968.397" y1="5316.604" y2="5613.728"/><line class="Streets-SmallAlleys" x1="1186.753" x2="1006.595" y1="1456.559" y2="1480.554"/><line class="Streets-SmallAlleys" x1="1366.717" x2="1546.682" y1="1432.564" y2="1408.569"/><line class="Streets-SmallAlleys" x1="814.828" x2="988.793" y1="1372.576" y2="1348.581"/><line class="Streets-SmallAlleys" x1="598.871" x2="460.899" y1="1402.57" y2="1420.566"/><line class="Streets-SmallAlleys" x1="412.908" x2="959.177" y1="1198.611" y2="1126.625"/><line class="Streets-SmallAlleys" x1="940.803" x2="1018.787" y1="976.655" y2="964.657"/><line class="Streets-SmallAlleys" x1="623.168" x2="634.864" y1="1170.903" y2="1276.595"/><line class="Streets-SmallAlleys" x1="761.116" x2="772.836" y1="1152.725" y2="1252.6"/><line class="Streets-SmallAlleys" x1="3538.283" x2="4000.191" y1="1822.486" y2="1336.583"/><path class="Streets-SmallAlleys" d="M3853.455,1105.872c0,0-39.227,68.744,32.759,128.732 c71.986,59.988,347.93,311.938,347.93,311.938"/><line class="Streets-SmallAlleys" x1="3913.428" x2="4615.497" y1="1717.252" y2="1003.272"/><line class="Streets-SmallAlleys" x1="4636.063" x2="4792.032" y1="3376.175" y2="3544.142"/><path class="Streets-SmallAlleys" d="M5272.089,3712.304l-246.104-279.655c0,0-40.01-63.502-115.986,0 c-75.976,63.502-225.946,225.469-225.946,225.469s-41.992,11.998,17.996,71.986c59.988,59.988,77.984,73.896,77.984,73.896 s5.999,58.078,83.983-19.906s250.583-250.747,250.583-250.747"/><polyline class="Streets-SmallAlleys" points="4977.995,2344.382 5139.963,2506.296 4924.006,2726.969 "/><line class="Streets-SmallAlleys" x1="4954" x2="5949.801" y1="2044.442" y2="3034.244"/><polyline class="Streets-SmallAlleys" points="3202.771,2421.952 3028.385,2612.616 3193.894,2777.01 "/><polyline class="Streets-SmallAlleys" points="2497.406,3142.222 2620.88,3022.34 2794.11,3195.89 "/><line class="Streets-SmallAlleys" x1="3850.59" x2="3904.21" y1="-22.84" y2="388.773"/><polyline class="Streets-SmallAlleys" points="3238.343,226.805 3238.343,268.797 2799.084,340.782 "/><polyline class="Streets-SmallAlleys" points="1570.677,1717.252 1696.651,1696.511 1720.647,1892 "/><line class="Streets-SmallAlleys" x1="1918.607" x2="2116.567" y1="424.765" y2="400.77"/><line class="Streets-SmallAlleys" x1="2164.924" x2="2199.625" y1="247.087" y2="424.765"/><line class="Streets-SmallAlleys" x1="2318.333" x2="2344.576" y1="222.522" y2="400.77"/><line class="Streets-SmallAlleys" x1="2978.624" x2="2998.391" y1="1510.548" y2="1690.512"/><line class="Streets-SmallAlleys" x1="2590.589" x2="3590.098" y1="1170.903" y2="995.005"/><line class="Streets-SmallAlleys" x1="2536.043" x2="3018.713" y1="790.763" y2="712.708"/><line class="Streets-SmallAlleys" x1="3328.325" x2="3334.515" y1="692" y2="851.874"/><line class="Streets-SmallAlleys" x1="3322.326" x2="3382.314" y1="70.836" y2="454.759"/><line class="Streets-SmallAlleys" x1="3470.901" x2="3639.716" y1="262.798" y2="226.805"/><path class="Streets-SmallAlleys" d="M4636.063,2116.427c0,0-71.985-47.99,0-119.976 c71.986-71.986,885.937-863.827,885.937-863.827"/><line class="Streets-SmallAlleys" x1="253.94" x2="585.434" y1="2334.156" y2="2278.624"/><line class="Streets-SmallAlleys" x1="706.849" x2="826.481" y1="1276.595" y2="2030.341"/><line class="Streets-SmallAlleys" x1="748.841" x2="580.625" y1="2224.406" y2="2248.44"/><path class="Streets-SmallAlleys" d="M1276.707,3513.54c0,0,48.019,9.119,36.021-109.114S778.336-13.147,778.336-13.147"/><line class="Streets-SmallAlleys" x1="4222.146" x2="4090.173" y1="4701.91" y2="4569.937"/><line class="Streets-SmallAlleys" x1="3869.855" x2="4078.175" y1="4538.314" y2="4335.983"/><line class="Streets-SmallAlleys" x1="3922" x2="4126.166" y1="4605.929" y2="4413.968"/><line class="Streets-SmallAlleys" x1="4163.115" x2="4298" y1="4168.953" y2="4299.99"/><line class="Streets-SmallAlleys" x1="5343.922" x2="5522" y1="1990.452" y2="1822.486"/></g><g id="Streets-Minor_1_"><line class="Streets-Minor" x1="-14" x2="4962" y1="4964" y2="0"/><line class="Streets-Minor" x1="5522" x2="2871.66" y1="4780" y2="2085.299"/><path class="Streets-Minor" d="M-38,2172l1904-312c0,0,96,624,112,719.669s64,119.481,64,119.481l120,121.412L4826,5500"/><path class="Streets-Minor" d="M1866,1860l1240-200c0,0,111.968-16.032,183.984,7.984"/><line class="Streets-Minor" x1="-14" x2="3802.611" y1="1780" y2="1156.593"/><path class="Streets-Minor" d="M3394,5500L1434,3540c0,0-80-48-240-16S-38,3724-38,3724"/><line class="Streets-Minor" x1="-14" x2="1932.354" y1="3356" y2="3022.34"/><line class="Streets-Minor" x1="1474" x2="5522" y1="5516" y2="1492"/><line class="Streets-Minor" x1="5522" x2="4298" y1="1892" y2="692"/><polyline class="Streets-Minor" points="-14,596 4882,-188 5538,452 450,5540 "/><line class="Streets-Minor" x1="3442" x2="5594" y1="5556" y2="3388"/><line class="Streets-Minor" x1="2464.488" x2="5505.89" y1="5516" y2="2488.575"/><line class="Streets-Minor" x1="-38" x2="1594.672" y1="226.805" y2="-37.142"/><polyline class="Streets-Minor" points="184.954,-235.103 856.819,3982.054 910.498,4041.731 "/><line class="Streets-Minor" x1="334.924" x2="28.985" y1="4060" y2="2152.42"/><line class="Streets-Minor" x1="484.894" x2="1966.095" y1="4032.946" y2="5516"/><line class="Streets-Minor" x1="-25.004" x2="4738.94" y1="988.653" y2="222.522"/><line class="Streets-Minor" x1="-25.004" x2="4090.173" y1="1390.572" y2="730.704"/><polyline class="Streets-Minor" points="3940.203,-181.113 4099.702,860.218 5085.974,1912.468 "/><line class="Streets-Minor" x1="2401.189" x2="2686.47" y1="-49.14" y2="1727.666"/><path class="Streets-Minor" d="M3412.308-97.13l230.11,1413.53C3586.836,1476.799,3770,1572,3770,1572l1730,1752"/><line class="Streets-Minor" x1="-84.992" x2="592.872" y1="4887.873" y2="5577.735"/><line class="Streets-Minor" x1="4450.101" x2="5522" y1="5529.745" y2="4472"/><line class="Streets-Minor" x1="2925.125" x2="3150.25" y1="-7.148" y2="1654.759"/><line class="Streets-Minor" x1="4262.183" x2="5529.885" y1="2070.442" y2="814.687"/><line class="Streets-Minor" x1="-31.003" x2="2852.159" y1="2563.559" y2="2104.752"/><line class="Streets-Minor" x1="-48.999" x2="1988.159" y1="2961.953" y2="2621.303"/><polyline class="Streets-Minor" points="1312.728,-61.137 1420.935,756.119 1493.097,1147.145 1557.816,1523.259 1601.672,1903.314 1790,3058.239 "/></g><g id="Streets-Major_1_"><path class="Streets-Major" d="M3754,5540c0,0,512-488,856-808s760-760,952-928"/><path class="Streets-Major" d="M3922,5540c0,0,648-408,904-736s608-632,712-744"/></g><g id="Restrooms_2_"><polygon class="Restrooms" points="2563.065,2800.198 2577.417,2786.335 2596.336,2805.92 2598.406,2803.92 2600.457,2806.043 2590.239,2815.912 2588.529,2814.142 2576.331,2813.931 "/><polygon class="Restrooms" points="2590.589,2816.275 2607.691,2833.979 2612.162,2829.66 2612.442,2813.512 2620.88,2805.361 2609.312,2793.386 2598.769,2803.57 2601.169,2806.055 "/><polygon class="Restrooms" points="2758.942,2540.799 2761.102,2536.734 2765.2,2532.937 2759.186,2529.692 2761.191,2525.995 2759.803,2524.559 2769.605,2515.091 2795.137,2541.523 2799.864,2536.956 2810.5,2547.967 2799.311,2558.775 2796.988,2561.019 "/><polygon class="Restrooms" points="2695.668,2517.502 2710.396,2532.748 2706.553,2536.46 2723.678,2554.188 2728.391,2556.693 2739.724,2535.802 2732.369,2531.812 2732.162,2532.012 2707.321,2506.296 "/><polygon class="Restrooms" points="2709.184,2504.495 2734.026,2530.212 2732.875,2531.323 2740.044,2535.211 2746.468,2523.37 2753.094,2516.969 2725.666,2488.575 "/></g><g id="Units_31_"><g><rect class="Units" data-unit="11096573" height="49.375" transform="matrix(0.6948 0.7192 -0.7192 0.6948 2779.1414 -824.1522)" waypoint-unit="45936" width="22.264" x="2349.42" y="2837.503"/></g><g><polygon class="Units" data-unit="11096370" points="2350.53,2887.349 2311.187,2925.353 2291.568,2905.043 2200.475,2810.74 2239.939,2772.619 2261.658,2795.104 2261.433,2795.32 2272.031,2806.292 2300.619,2778.677 2314.436,2778.916 2370.574,2837.032 2335.062,2871.336 " waypoint-unit="45918"/></g><g><polygon class="Units" data-unit="11096629" points="2261.433,2795.32 2261.658,2795.104 2239.939,2772.619 2252.95,2760.051 2268.135,2745.383 2272.135,2749.524 2272.03,2755.631 2287.567,2755.9 2289.249,2754.275 2292.675,2757.821 2293.391,2757.129 2300.858,2764.86 2300.619,2778.677 2272.031,2806.292 " waypoint-unit="45861"/></g><g><polygon class="Units" data-unit="11096503" points="2318.244,2918.536 2386.042,2853.045 2386.542,2853.563 2386.427,2860.212 2409.466,2884.129 2409.513,2899.201 2409.18,2918.396 2380.343,2946.046 2387.394,2953.345 2361.959,2977.915 2327.372,2942.109 2311.187,2925.353 " waypoint-unit="45902"/></g><g><polygon class="Units" data-unit="11096593" points="2394.396,3011.494 2390.245,3007.198 2387.678,3004.54 2361.959,2977.915 2387.394,2953.345 2380.343,2946.046 2409.18,2918.396 2409.513,2899.201 2409.466,2884.129 2414.563,2881.535 2444.281,2882.05 2451.59,2889.616 2461.25,2889.784 2460.568,2929.161 2445.606,2962.027 2427.458,2979.558 " waypoint-unit="45899"/></g><g><polygon class="Units" data-unit="11096374" points="2394.396,3011.494 2434.7,3053.219 2482.171,3007.364 2450.751,2974.837 2487.557,2939.283 2483.874,2935.469 2484.657,2890.189 2461.25,2889.784 2460.568,2929.161 2445.606,2962.027 2427.458,2979.558 " waypoint-unit="45879"/></g><g><polygon class="Units" data-unit="11096439" points="2482.171,3007.364 2470.219,2994.991 2450.751,2974.837 2487.557,2939.283 2483.874,2935.469 2484.657,2890.189 2484.888,2890.193 2497.355,2878.151 2528.181,2910.063 2527.767,2910.463 2554.179,2937.806 " waypoint-unit="45859"/></g><g><polygon class="Units" data-unit="11096617" points="2528.181,2910.063 2527.767,2910.463 2554.179,2937.806 2583.509,2909.475 2525.273,2849.188 2497.906,2848.714 2497.397,2878.11 2497.355,2878.151 " waypoint-unit="45917"/></g><g><polygon class="Units" data-unit="11096591" points="2497.906,2848.714 2525.273,2849.188 2583.509,2909.475 2660.903,2834.715 2626.963,2799.486 2612.442,2813.512 2612.162,2829.66 2607.691,2833.979 2588.529,2814.142 2576.331,2813.931 2570.198,2807.582 2556.581,2820.743 2545.049,2808.46 2491.179,2807.527 2490.651,2838.04 2497.96,2845.607 " waypoint-unit="45944"/></g><g><polygon class="Units" data-unit="11096501" points="2491.179,2807.527 2491.249,2803.456 2512.992,2782.454 2528.022,2798.014 2548.58,2798.37 2558.999,2809.156 2563.59,2809.236 2565.957,2811.686 2556.753,2820.576 2545.049,2808.46 " waypoint-unit="45934"/></g><g><polygon class="Units" data-unit="11096637" points="2512.992,2782.454 2529.856,2766.164 2562.56,2800.02 2562.387,2800.186 2569.856,2807.919 2565.957,2811.686 2563.59,2809.236 2558.999,2809.156 2548.58,2798.37 2528.022,2798.014 " waypoint-unit="45878"/></g><g><polygon class="Units" data-unit="11096517" points="2529.856,2766.164 2537.84,2758.451 2551.41,2758.686 2563.278,2770.972 2562.915,2771.323 2577.083,2785.99 2562.56,2800.02 " waypoint-unit="45858"/></g><g><polygon class="Units" data-unit="11096441" points="2457.419,2778.438 2467.247,2778.608 2491.474,2755.205 2464.294,2727.068 2458.31,2726.964 " waypoint-unit="45898"/></g><g><polygon class="Units" data-unit="11096621" points="2415.294,2795.075 2415.788,2795.083 2433.458,2778.023 2439.791,2778.133 2439.924,2770.456 2436.655,2770.4 2432.682,2755.365 2432.913,2742.028 2439.832,2742.148 2440.11,2726.648 2440.66,2726.658 2441.214,2694.65 2424.993,2677.857 2405.514,2696.672 2416.795,2708.351 " waypoint-unit="45875"/></g><g><polygon class="Units" data-unit="11096493" points="2372.753,2789.562 2377.446,2794.42 2415.294,2795.075 2416.795,2708.351 2405.442,2696.742 2371.727,2729.31 2381.687,2739.621 2379.618,2741.623 2378.89,2783.634 " waypoint-unit="45945"/></g><g><polygon class="Units" data-unit="11096623" points="2372.753,2789.562 2347.751,2763.678 2353.826,2757.81 2354.079,2743.154 2370.126,2727.654 2381.687,2739.621 2379.618,2741.623 2378.89,2783.634 " waypoint-unit="45880"/></g><g><polygon class="Units" data-unit="11096589,11096431" points="2347.751,2763.678 2330.873,2746.206 2318.209,2733.024 2320.4,2730.907 2319.717,2730.2 2321.682,2728.302 2318.398,2724.902 2318.568,2715.115 2324.432,2709.451 2323.392,2708.374 2330.196,2701.802 2336.563,2708.394 2355.18,2690.555 2355.98,2691.383 2370.453,2677.402 2372.344,2679.359 2375.657,2676.159 2373.767,2674.202 2387.468,2660.967 2389.358,2662.924 2392.671,2659.724 2390.781,2657.767 2404.482,2644.532 2406.372,2646.489 2409.685,2643.289 2407.795,2641.332 2421.496,2628.097 2420.579,2627.148 2441.856,2606.596 2462.308,2627.769 2469.325,2635.033 2371.727,2729.31 2370.126,2727.654 2354.079,2743.154 2353.826,2757.81 " waypoint-unit="45946,45941"/></g><g><polygon class="Units" data-unit="11096619" points="2439.983,2733.713 2458.188,2734.029 2458.31,2726.964 2464.294,2727.068 2491.474,2755.205 2521.068,2726.619 2521.309,2712.71 2513.141,2704.255 2509.241,2708.022 2462.569,2659.705 2461.931,2660.322 2452.863,2650.935 2424.993,2677.857 2441.214,2694.65 2440.66,2726.658 2440.11,2726.648 2439.978,2733.713 " waypoint-unit="45912"/></g><g><polygon class="Units" data-unit="11096407" points="2632.488,2986.138 2762.01,2861.025 2764.408,2863.507 2771.103,2857.04 2768.703,2854.555 2820.264,2804.75 2822.762,2807.336 2856.903,2774.03 2854.568,2771.613 2857.294,2768.979 2851.076,2762.542 2882.352,2732.33 2907.899,2707.652 2907.255,2707.308 2930.653,2684.706 2943.459,2672.258 2978.926,2708.975 2985.636,2715.922 3026.706,2676.25 3037.98,2687.922 3059.599,2710.303 3077.034,2728.353 3096.42,2748.421 3149.959,2803.847 2791.175,3150.418 " waypoint-unit="57877"/></g><g><polygon class="Units" data-unit="11096643" points="2429.58,2593.916 2495.525,2662.156 2494.895,2662.764 2509.514,2677.899 2519.882,2688.632 2600.112,2611.133 2565.381,2592.547 2543.459,2569.853 2551.618,2561.972 2552.102,2562.472 2575.192,2540.168 2560.48,2524.938 2563.224,2522.287 2542.292,2500.617 2536.366,2494.483 2535.805,2495.025 2537.348,2496.622 2535.803,2498.115 2538.926,2501.348 2538.381,2501.875 2537.073,2500.521 2535.68,2501.867 2529.348,2495.309 2522.754,2501.674 2520.875,2499.728 2505.186,2514.772 2507.819,2517.499 2498.431,2526.566 2497.697,2525.805 2498.663,2524.872 2496.796,2522.939 2479.878,2539.282 2482.338,2542.112 2472.479,2551.635 2469.744,2548.804 2455.281,2562.976 2458.512,2566.323 2448.262,2576.224 2447.285,2575.212 2430.937,2590.948 2431.746,2591.824 " waypoint-unit="45894"/></g><g><polygon class="Units" data-unit="11096555" points="2519.882,2688.632 2537.067,2706.422 2545.935,2697.821 2557.225,2686.915 2560.161,2689.953 2591.49,2659.487 2571.49,2638.781 2547.362,2662.088 " waypoint-unit="45920"/></g><g><polygon class="Units" data-unit="11096491" points="2600.112,2611.133 2586.266,2624.508 2606.267,2645.213 2611.681,2639.984 2621.1,2622.365 " waypoint-unit="45948"/></g><g><rect class="Units" data-unit="11096465" height="28.788" transform="matrix(0.7192 -0.6948 0.6948 0.7192 -1108.7048 2540.4124)" waypoint-unit="45938" width="20.545" x="2578.606" y="2627.604"/></g><g><polygon class="Units" data-unit="11096601" points="2582.18,2546.383 2575.701,2539.676 2568.463,2546.668 2564.584,2550.415 2552.102,2562.472 2551.618,2561.972 2543.459,2569.853 2560.375,2587.365 " waypoint-unit="45863"/></g><g><polygon class="Units" data-unit="11096415" points="2573.685,2725.562 2659.566,2642.599 2660.55,2641.649 2812.442,2798.894 2807.814,2803.361 2807.115,2802.638 2803.699,2805.938 2811.103,2813.603 2641.323,2977.604 2612.534,2947.801 2579.373,2913.47 2660.903,2834.715 2602.469,2774.129 2598.169,2769.677 2564.302,2734.625 " waypoint-unit="45942"/></g><g><polygon class="Units" data-unit="11096681,11096457" points="2549.365,2467.823 2560.369,2457.193 2563.831,2460.777 2563.141,2461.443 2564.141,2462.479 2574.913,2452.073 2574.013,2451.142 2573.323,2451.808 2571.289,2449.703 2585.876,2435.612 2587.91,2437.717 2587.22,2438.384 2588.02,2439.212 2600.451,2427.2 2612.9,2439.926 2611.772,2441.016 2616.735,2446.154 2620.606,2442.415 2616.556,2438.221 2625.9,2429.195 2629.846,2433.281 2633.765,2429.495 2629.819,2425.409 2639.177,2416.37 2643.215,2420.551 2647.113,2416.786 2643.074,2412.605 2651.648,2404.323 2655.595,2408.408 2661.595,2402.706 2657.602,2398.572 2664.613,2391.8 2668.577,2395.872 2673.509,2391.138 2723.66,2443.056 2747.374,2467.606 2806.063,2530.006 2795.154,2540.539 2769.612,2514.116 2759.642,2523.748 2725.666,2488.575 2678.92,2533.729 2669.919,2524.411 2648.039,2545.546 2623.039,2532.27 2604.18,2512.746 2600.307,2516.487 2590.192,2506.016 2590.943,2505.291 2588.977,2503.255 2591.61,2500.711 2585.756,2494.649 2583.142,2497.171 2576.691,2490.491 2579.329,2488.009 2576.637,2484.89 2581.496,2480.185 2576.252,2474.339 2575.348,2475.15 2573.523,2473.262 2564.868,2481.626 2558.551,2475.086 2557.428,2476.171 " waypoint-unit="45927,45921"/></g><g><polygon class="Units" data-unit="11096435" points="2439.791,2778.133 2457.419,2778.438 2458.188,2734.029 2439.978,2733.688 2439.832,2742.148 2432.913,2742.028 2432.682,2755.365 2436.655,2770.4 2439.924,2770.456 " waypoint-unit="45940"/></g><g><polygon class="Units" data-unit="11096378" points="2664.786,2554.444 2695.79,2570.916 2705.484,2552.67 2683.197,2529.598 2678.92,2533.729 2678.392,2533.183 2673.647,2537.766 " waypoint-unit="45872"/></g><g><polygon class="Units" data-unit="11096627" points="2695.79,2570.916 2715.302,2581.297 2728.391,2556.693 2723.678,2554.188 2706.553,2536.46 2710.396,2532.748 2695.693,2517.528 2683.197,2529.598 2705.484,2552.67 2695.78,2570.911 " waypoint-unit="45852"/></g><g><polygon class="Units" data-unit="11096455" points="2737.227,2569.394 2758.345,2580.614 2774.646,2549.937 2754.12,2539.031 2741.159,2563.479 2740.568,2563.159 2737.249,2569.406 " waypoint-unit="45843"/></g><g><polygon class="Units" data-unit="11096417" points="2758.416,2580.652 2779.592,2591.948 2782.165,2587.105 2781.545,2586.775 2792.589,2565.988 2806.168,2573.203 2827.698,2552.407 2806.14,2530.088 2799.882,2535.974 2811.484,2547.984 2797.106,2561.872 2774.646,2549.937 2758.345,2580.614 " waypoint-unit="45928"/></g><g><polygon class="Units" data-unit="11096599" points="2799.094,2596.097 2822.791,2608.689 2835.791,2584.221 2847.53,2572.945 2841.34,2566.533 2828.179,2552.909 2807.651,2572.738 2810.137,2575.312 " waypoint-unit="45932"/></g><g><polygon class="Units" data-unit="11096379" points="2822.791,2608.689 2846.475,2621.277 2858.467,2598.735 2865.755,2591.816 2847.53,2572.945 2835.791,2584.221 " waypoint-unit="45914"/></g><g><polygon class="Units" data-unit="11096437" points="2862.371,2652.542 2875.99,2626.92 2876.497,2627.445 2877.747,2625.093 2879.239,2623.652 2871.952,2616.108 2854.173,2606.816 2858.467,2598.735 2865.755,2591.816 2888.172,2615.022 2902.573,2629.932 2873.731,2657.792 2870.942,2656.309 2870.615,2656.924 " waypoint-unit="45910"/></g><g><polygon class="Units" data-unit="11096529" points="2857.551,2681.498 2863.642,2684.757 2863.97,2684.144 2907.255,2707.308 2912.476,2702.265 2943.459,2672.258 2902.573,2629.932 2873.731,2657.792 2870.942,2656.309 " waypoint-unit="45845"/></g><g><polygon class="Units" data-unit="11096405" points="2835.784,2722.482 2872.33,2742.011 2907.899,2707.652 2886.371,2696.132 2876.361,2714.836 2853.776,2702.836 2853.99,2702.391 2847.893,2699.14 " waypoint-unit="45891"/></g><g><polygon class="Units" data-unit="11096615" points="2832.675,2745.979 2843.391,2757.071 2845.663,2759.42 2845.413,2759.662 2849.585,2763.981 2872.33,2742.011 2843.05,2726.452 " waypoint-unit="45871"/></g><g><polygon class="Units" data-unit="11096543" points="2821.479,2712.589 2833.411,2690.132 2819.786,2676.026 2802.392,2692.828 " waypoint-unit="45911"/></g><g><rect class="Units" data-unit="11096425" height="13.069" transform="matrix(-0.7192 0.6948 -0.6948 -0.7192 6625.564 2700.0759)" waypoint-unit="45896" width="24.739" x="2754.851" y="2682.227"/></g><g><polygon class="Units" data-unit="11096605" points="2758.356,2688.238 2749.013,2678.566 2757.151,2663.256 2774.614,2672.534 " waypoint-unit="45876"/></g><g><polygon class="Units" data-unit="11096477" points="2754.264,2639.605 2763.855,2621.553 2748.946,2606.118 2728.468,2625.899 " waypoint-unit="45856"/></g><g><polygon class="Units" data-unit="11096539" points="2692.163,2624.411 2707.021,2596.444 2690.326,2587.574 2672.869,2604.438 " waypoint-unit="45854"/></g><g><rect class="Units" data-unit="11096395" height="20.994" transform="matrix(-0.883 -0.4693 0.4693 -0.883 3755.8772 6133.8608)" waypoint-unit="45851" width="19.048" x="2632.856" y="2588.352"/></g></g><g id="Elevators_7_"><g><rect class="Elevators" height="9.213" transform="matrix(-0.7192 0.6948 -0.6948 -0.7192 6317.0552 2938.4653)" width="6.91" x="2561.344" y="2741.014"/></g><g><rect class="Elevators" height="9.213" transform="matrix(-0.7192 0.6948 -0.6948 -0.7192 6337.2153 2947.436)" width="6.91" x="2569.611" y="2749.573"/></g><g><rect class="Elevators" height="9.213" transform="matrix(-0.7192 0.6948 -0.6948 -0.7192 6357.376 2956.407)" width="6.91" x="2577.879" y="2758.131"/></g><g><rect class="Elevators" height="9.213" transform="matrix(-0.7192 0.6948 -0.6948 -0.7192 6377.5361 2965.3777)" width="6.91" x="2586.146" y="2766.69"/></g><g><rect class="Elevators" height="9.213" transform="matrix(-0.7192 0.6948 -0.6948 -0.7192 6397.6963 2974.3486)" width="6.91" x="2594.414" y="2775.249"/></g></g><g id="Escalators_7_"><g><polygon class="Escalators" points="2599.529,2587.892 2602.264,2582.753 2627.994,2596.437 2625.458,2601.208 "/></g><g><polygon class="Escalators" points="2606.6,2574.594 2609.335,2569.454 2635.506,2583.312 2632.726,2588.562 "/></g><g><rect class="Escalators" height="30.474" transform="matrix(-0.9999 -0.0173 0.0173 -0.9999 4774.9316 5718.5024)" width="6.238" x="2409.097" y="2823.348"/></g><g><rect class="Escalators" height="30.474" transform="matrix(-0.9999 -0.0173 0.0173 -0.9999 4879.7456 5687.2158)" width="6.238" x="2461.369" y="2807.251"/></g></g><g id="Stairs_2_"><g><polygon class="Stairs" points="2611.392,2587.261 2615.43,2579.669 2631.137,2587.997 2627.011,2595.572 "/></g><g><rect class="Stairs" height="4.894" transform="matrix(-0.7192 0.6948 -0.6948 -0.7192 6314.9683 2825.6262)" width="34.068" x="2569.521" y="2686.332"/></g></g><g id="LBox_1_"><rect class="LBox" data-lbox="11096629" height="28.959" transform="matrix(0.7071 0.7071 -0.7071 0.7071 2630.7864 -802.8344)" waypoint-lbox="45861" width="12.602" x="2278.199" y="2759.743"/><rect class="LBox" data-lbox="11096623" height="30.258" waypoint-lbox="45880" width="11.764" x="2364.769" y="2747.969"/><rect class="LBox" data-lbox="11096493" height="37.111" waypoint-lbox="45945" width="28.355" x="2383.322" y="2755.516"/><rect class="LBox" data-lbox="11096621" height="83.099" waypoint-lbox="45875" width="11.458" x="2420.228" y="2695.333"/><rect class="LBox" data-lbox="11096435" height="40.532" waypoint-lbox="45940" width="11.329" x="2443.688" y="2735.25"/><rect class="LBox" data-lbox="11096441" height="24.236" transform="matrix(0.7071 0.7071 -0.7071 0.7071 2673.9177 -941.6357)" waypoint-lbox="45898" width="17.988" x="2464.619" y="2744.768"/><rect class="LBox" data-lbox="11096591" height="26.814" waypoint-lbox="45944" width="44.645" x="2494.959" y="2812.245"/><rect class="LBox" data-lbox="11096573" height="37.369" transform="matrix(0.7071 0.7071 -0.7071 0.7071 2714.4932 -832.6582)" waypoint-lbox="45936" width="15.018" x="2354.845" y="2841.669"/><rect class="LBox" data-lbox="11096370" height="70.133" transform="matrix(0.7071 0.7071 -0.7071 0.7071 2679.9104 -806.39)" waypoint-lbox="45918" width="69.296" x="2278.706" y="2796.677"/><rect class="LBox" data-lbox="11096503" height="48.348" transform="matrix(0.7071 0.7071 -0.7071 0.7071 2743.7222 -829.2301)" waypoint-lbox="45902" width="39.671" x="2352.995" y="2873.177"/><rect class="LBox" data-lbox="11096589,11096431" height="75.126" transform="matrix(0.7071 0.7071 -0.7071 0.7071 2593.9053 -920.6364)" waypoint-lbox="45946,45941" width="25.081" x="2395.719" y="2633.239"/><rect class="LBox" data-lbox="11096593" height="42.679" waypoint-lbox="45899" width="40.768" x="2416.659" y="2891.261"/><rect class="LBox" data-lbox="11096374" height="44.337" waypoint-lbox="45879" width="16.092" x="2464.954" y="2892.831"/><rect class="LBox" data-lbox="11096617" height="48.114" transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 6345.0181 3126.4912)" waypoint-lbox="45917" width="26.205" x="2511.889" y="2853.285"/><rect class="LBox" data-lbox="11096501" height="9.797" waypoint-lbox="45934" width="21.497" x="2502.292" y="2795.387"/><rect class="LBox" data-lbox="11096637" height="21.198" transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 6287.3115 2962.5889)" waypoint-lbox="45878" width="16.611" x="2521.778" y="2772.84"/><rect class="LBox" data-lbox="11096517" height="13.936" transform="matrix(0.7071 0.7071 -0.7071 0.7071 2710.1965 -991.9601)" waypoint-lbox="45858" width="31.284" x="2536.858" y="2768.549"/><rect class="LBox" data-lbox="11096415" height="93.318" transform="matrix(0.7071 0.7071 -0.7071 0.7071 2719.9602 -1094.288)" waypoint-lbox="45942" width="159.864" x="2600.97" y="2689.479"/><rect class="LBox" data-lbox="11096643" height="49.255" transform="matrix(0.7071 0.7071 -0.7071 0.7071 2585.9468 -1032.8654)" waypoint-lbox="45894" width="86.648" x="2496.428" y="2580.453"/><rect class="LBox" data-lbox="11096555" height="28.001" transform="matrix(0.7071 0.7071 -0.7071 0.7071 2635.0491 -1038.2838)" waypoint-lbox="45920" width="21.662" x="2560.013" y="2647.643"/><rect class="LBox" data-lbox="11096465" height="16.215" transform="matrix(0.7071 0.7071 -0.7071 0.7071 2627.5254 -1057.6229)" waypoint-lbox="45938" width="21.425" x="2579.714" y="2634.785"/><rect class="LBox" data-lbox="11096491" height="13.67" transform="matrix(0.8776 0.4795 -0.4795 0.8776 1578.725 -927.8005)" waypoint-lbox="45948" width="17.995" x="2597.002" y="2620.415"/><rect class="LBox" data-lbox="11096601" height="29.612" transform="matrix(0.7071 0.7071 -0.7071 0.7071 2563.177 -1060.0327)" waypoint-lbox="45863" width="9.301" x="2556.511" y="2549.206"/><rect class="LBox" data-lbox="11096681,11096457" height="73.914" transform="matrix(0.7071 0.7071 -0.7071 0.7071 2526.0488 -1134.7686)" waypoint-lbox="45927,45921" width="68.077" x="2598.773" y="2444.869"/><rect class="LBox" data-lbox="11096455" height="27.862" transform="matrix(0.8885 0.4589 -0.4589 0.8885 1482.2091 -979.4843)" waypoint-lbox="45843" width="17.991" x="2747.404" y="2545.981"/><rect class="LBox" data-lbox="11096378" height="12.802" transform="matrix(0.8885 0.4589 -0.4589 0.8885 1472.538 -947.0112)" waypoint-lbox="45872" width="28.997" x="2670.251" y="2549.849"/><rect class="LBox" data-lbox="11096627" height="23.672" transform="matrix(0.8885 0.4589 -0.4589 0.8885 1479.0555 -958.307)" waypoint-lbox="45852" width="18.068" x="2702.216" y="2552.176"/><rect class="LBox" data-lbox="11096477" height="16.255" transform="matrix(0.8885 0.4589 -0.4589 0.8885 1510.7922 -968.9277)" waypoint-lbox="45856" width="16.135" x="2740.903" y="2615.873"/><rect class="LBox" data-lbox="11096605" height="12.829" transform="matrix(0.8885 0.4589 -0.4589 0.8885 1535.3636 -968.253)" waypoint-lbox="45876" width="10.999" x="2754.368" y="2668.479"/><rect class="LBox" data-lbox="11096425" height="20.659" transform="matrix(0.7083 0.706 -0.706 0.7083 2705.4443 -1168.9811)" waypoint-lbox="45896" width="9.468" x="2762.31" y="2678.432"/><rect class="LBox" data-lbox="11096543" height="18.358" transform="matrix(0.7083 0.706 -0.706 0.7083 2724.0159 -1203.8557)" waypoint-lbox="45911" width="15.797" x="2810.625" y="2684.614"/><rect class="LBox" data-lbox="11096437" height="22.475" transform="matrix(0.7083 0.706 -0.706 0.7083 2703.7332 -1263.8625)" waypoint-lbox="45910" width="13.397" x="2874.285" y="2628.012"/><rect class="LBox" data-lbox="11096529" height="23.425" transform="matrix(0.8932 0.4497 -0.4497 0.8932 1510.7999 -1008.2618)" waypoint-lbox="45845" width="27.261" x="2864.119" y="2664.329"/><rect class="LBox" data-lbox="11096405" height="22.475" transform="matrix(0.8932 0.4497 -0.4497 0.8932 1527.4363 -994.2266)" waypoint-lbox="45891" width="29.186" x="2841.932" y="2706.841"/><rect class="LBox" data-lbox="11096417" height="30.173" transform="matrix(0.8885 0.4589 -0.4589 0.8885 1489.5176 -987.59)" waypoint-lbox="45928" width="20.472" x="2766.495" y="2555.81"/><rect class="LBox" data-lbox="11096539" height="16.255" transform="matrix(0.8885 0.4589 -0.4589 0.8885 1496.5533 -944.3343)" waypoint-lbox="45854" width="15.151" x="2683.675" y="2598.873"/><rect class="LBox" data-lbox="11096395" height="15.185" transform="matrix(0.8885 0.4589 -0.4589 0.8885 1487.5239 -922.5918)" waypoint-lbox="45851" width="11.673" x="2636.163" y="2591.701"/><rect class="LBox" data-lbox="11096407" height="253.765" transform="matrix(0.7071 0.7071 -0.7071 0.7071 2886.2856 -1219.0416)" waypoint-lbox="57877" width="203.378" x="2812.967" y="2747.652"/><rect class="LBox" data-lbox="11096619" height="90.417" transform="matrix(0.714 -0.7001 0.7001 0.714 -1185.1871 2507.6001)" waypoint-lbox="45912" width="31.826" x="2460.962" y="2659.339"/><rect class="LBox" data-lbox="11096599" height="24.25" transform="matrix(0.8806 0.4738 -0.4738 0.8806 1562.7185 -1025.9282)" waypoint-lbox="45932" width="22.125" x="2806.502" y="2576.507"/><rect class="LBox" data-lbox="11096379" height="18.022" transform="matrix(0.8864 0.4629 -0.4629 0.8864 1528.568 -1018.9963)" waypoint-lbox="45914" width="23.797" x="2828.503" y="2595.817"/><rect class="LBox" data-lbox="11096615" height="17.024" transform="matrix(0.8786 0.4775 -0.4775 0.8786 1655.05 -1028.4205)" waypoint-lbox="45871" width="24.457" x="2838.389" y="2733.066"/><rect class="LBox" data-lbox="11096439" height="54.818" transform="matrix(0.73 -0.6834 0.6834 0.73 -1312.8572 2503.9185)" waypoint-lbox="45859" width="21.897" x="2501.81" y="2886.221"/></g><g id="CustomArtLayer-1_1_"></g><g id="CustomArtLayer-2_1_"></g><g id="CustomArtLayer-3_1_"></g><g id="CustomArtLayer-4_1_"></g><g id="CustomArtLayer-5_1_"></g><g id="Pattern-1_9_"></g><g id="Pattern-2_9_"></g><g id="Pattern-3_9_"></g><g id="Pattern-Pavement_9_"></g><g id="Pattern-Grass_9_"></g><g id="Pattern-Trees_9_"></g><g id="Pattern-Water_9_"></g><g id="Pattern-OutdoorTerrace_9_"></g><g id="Pattern-IndoorFoodCourt-Seating_9_"></g><g id="Pattern-Lounge_9_"></g><g></g></svg>',
      waypoints: [125]
    }

    let loc = new Map_(data, _DOMParser)

    it('should reflect input', function() {
      expect(loc.defaultMapForDevice).to.eql(data.map.defaultMapForDevice)
      expect(loc.description).to.eql(data.map.description)
      expect(loc.floorSequence).to.eql(data.map.floorSequence)
      expect(loc.locationId).to.eql(data.map.locationId)
      expect(loc.locationName).to.eql(data.map.locationName)
      expect(loc.mapId).to.eql(data.map.mapId)
      expect(loc.name).to.eql(data.map.name)
      expect(loc.parentLocationId).to.eql(data.map.parentLocationId)
      expect(loc.preference).to.eql(data.map.preference)
      expect(loc.status).to.eql(data.map.status)
      expect(loc.statusDesc).to.eql(data.map.statusDesc)
      expect(loc.svgMap).to.eql(data.map.svgMap)
      expect(loc.thumbnailHTML).to.eql(data.map.thumbnailHTML)
      expect(loc.uri).to.eql(data.map.uri)
      expect(loc.xOffset).to.eql(data.map.xOffset)
      expect(loc.xScale).to.eql(data.map.xScale)
      expect(loc.yOffset).to.eql(data.map.yOffset)
      expect(loc.yScale).to.eql(data.map.yScale)
      expect(loc.svg).to.eql(data.svg)

      let rects = loc.svgTree.documentElement.getElementsByTagName('rect')
      let lboxes = []
      for(var i = 0; i < rects.length; i++) {
        let _class = rects[i].getAttribute('class')
        if(_class === 'LBox') lboxes.push(rects[i])
      }
      expect(loc.lboxes).to.be.an.instanceof(Array)
      expect(loc.lboxes).to.have.length(lboxes.length)

      expect(loc.WaypointCollection).to.be.an.instanceof(WaypointCollection)
      loc.WaypointCollection.getAll().forEach((w) => {
        expect(w).to.be.an.instanceof(Waypoint)
      })

      //TODO: Test constructors and collection classes
      // expect(loc.destinationLabels).to.eql(data.destinationLabels)
      // expect(loc.mapLabels).to.eql(data.mapLabels)
    });

  });

  describe('XmlParsing', function() {
    let data = {
      destinationLabels: [1, 2, 3],
      map: {
        defaultMapForDevice: false,
        description: 'LC',
        floorSequence: 0,
        locationId: 20,
        locationName: 'Lower Level 1',
        mapId: 126137,
        name: 'Concourse Level',
        parentLocationId: 9,
        preference: 0,
        status: 1,
        statusDesc: 'Active',
        svgMap: '/cms/maps/svg/126137SanFrancisco-Maps_v16_EXTENDED-public_LL1.svg',
        thumbnailHTML: 'hello',
        uri: '/cms/maps/126137SanFrancisco-Maps_v16_EXTENDED-public_LL1.png',
        xOffset: 0,
        xScale: 310.86049,
        yOffset: 0,
        yScale: 310.86049,
      },
      mapLabels: [0],
      svg: '5000000',
      svgTree: null,
      waypoints: [125]
    }

    it('Throws TypeError on xml parse error', function() {
      expect(() => {
        return new Map_(data, _DOMParser)
      }).to.throw(TypeError, /Map :: input contains invalid XML data/)
    });

  });

  describe('getWaypointsInArea', function() {
    let data = {
      waypoints: [{
        id: 1,
        x: 50,
        y: 50
      }, {
        id: 2,
        x: 1000,
        y: 50
      }, {
        id: 3,
        x: 50,
        y: 90
      }]
    }
    let map = new Map_(data, _DOMParser)
    let points = map.getWaypointsInArea({
      x: 50,
      y: 50
    }, 100)

    it('should return an array of waypoints', function() {
      points.forEach((wp) => {
        expect(wp).to.be.an.instanceof(Waypoint)
      })
    })

    it('should return an waypoint sorted by distance', function() {
      expect(points[0].id).to.equal(1)
      expect(points[1].id).to.equal(3)
    })

    it('should omit waypoints no inside radius', function() {
      points.forEach((wp) => {
        expect(wp.id).to.not.equal(2)
      })
    })

  });

})
