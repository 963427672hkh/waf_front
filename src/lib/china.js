/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import * as echarts from 'echarts'

// Ensure echarts and registerMap exist in this environment
if (!echarts || typeof echarts.registerMap !== 'function') {
    // Log a helpful message; the application will continue but map may not render
    // (this prevents a hard exception when bundlers don't expose globals the UMD wrapper expected)
    // eslint-disable-next-line no-console
    console.error('[china.js] echarts or echarts.registerMap is not available.');
} else {
    // A compact FeatureCollection with a few provinces as a safe default registration.
    // This file can be replaced with the full GeoJSON from vue-echarts-master if you prefer.
    const chinaGeo = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: { name: '广东' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[109, 25], [117, 25], [117, 20], [109, 20], [109, 25]]]
                }
            },
            {
                type: 'Feature',
                properties: { name: '浙江' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[118, 31], [123, 31], [123, 27], [118, 27], [118, 31]]]
                }
            },
            {
                type: 'Feature',
                properties: { name: '北京' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[115, 40], [117, 40], [117, 39], [115, 39], [115, 40]]]
                }
            }
        ]
    }

    try {
        echarts.registerMap('china', chinaGeo)
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[china.js] failed to register map:', err)
    }
}
