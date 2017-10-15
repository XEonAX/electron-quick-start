'use strict';
let si = require('systeminformation');
let ticker = module.exports = {
    TickInterval: null,
    Start: function () {
        if (this.TickInterval == null)
            this.TickInterval = setInterval(this.Tick, 1000);
    },
    Pause: function () {
        clearInterval(this.TickInterval);
        this.TickInterval = null;
    },
    Tick: function () {
        var _syncer = this.Syncer;
        si.currentLoad(function (cpudata) {
            si.mem(function (memdata) {
                var tickMsg = {
                    action: 'performancetick',
                    CPUTotal: cpudata.currentload,
                    MemoryUsed: (memdata.used / memdata.total) * 100
                    // AverageCores: cpudata.avgload,
                    // Cores: cpudata.cpus.map(function (cpu) {
                    //     return cpu.load;
                    // })
                };
                let syncer = require('./syncer');
                syncer.Tick(tickMsg);
            });
        });
    }

};