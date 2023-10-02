const chalk = require('chalk')
const { exec } = require('child_process')

if (process.argv.length < 3) {
    console.log(
        chalk.red(
            'not enough argument, please run with "--help" or "-h" to see more instruction'
        )
    )
    return
}

const argument = process.argv[2]
const allowedArgument = ['--help', '-h', '--list', '-l', '-p', '--port']

if (!allowedArgument.includes(argument)) {
    console.log(
        chalk.red(
            'invalid argument, please run with "--help" or "-h" to see more instruction'
        )
    )
    return
}

if (argument === '-h' || argument === '--help') {
    console.log(
        chalk.yellow('Usage: ') +
            chalk.green('docker-port-checker ') +
            chalk.yellow('[option] [port number(optional)]')
    )
    console.log(chalk.yellow('Option:'))
    console.log(
        chalk.green('\t--help, -h') +
            '\t\t\t' +
            chalk.yellow('Show this help message and exit')
    )
    console.log(
        chalk.green('\t--list, -l') +
            '\t\t\t' +
            chalk.yellow('Show the list of used port')
    )
    console.log(
        chalk.green('\t--port, -p') +
            '\t\t\t' +
            chalk.yellow(
                'Check if the port is being used, required one more argument to define to port number'
            )
    )
    return
}

let selectedPort = null
if (argument === '-p' || argument === '--port') {
    if (process.argv.length < 4) {
        console.log(
            chalk.red(
                'not enough argument, please run with "--help" or "-h" to see more instruction'
            )
        )
        return
    }

    selectedPort = process.argv[3]
}

exec('docker ps', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`)
        return
    }

    const dockerls = stdout.split('\n')
    const portMap = {}
    for (let i = 0; i < dockerls.length; i++) {
        const row = dockerls[i].split(' ')
        if (row[0] === 'CONTAINER') continue
        if (!row[3]) continue

        const containerName = row[3]

        const portList = row.filter((s) => s.includes('0.0.0.0:'))
        for (let j = 0; j < portList.length; j++) {
            const port = portList[j].split('->')[0].replace('0.0.0.0:', '')
            portMap[port] = containerName
        }
    }

    if (argument === '--list' || argument === '-l') {
        console.log('Used Port List: \n')
        for (const key in portMap) {
            const portNumber = chalk.green(key)
            const containerName = chalk.blue(portMap[key])
            console.log(portNumber + '\t| ' + containerName)
        }
    } else if (argument === '--port' || argument === '-p') {
        if (portMap[selectedPort]) {
            console.log(
                chalk.yellow('Container Name: ') +
                    chalk.blue(portMap[selectedPort]) +
                    chalk.yellow(' is using the current port')
            )
        } else {
            console.log(
                chalk.yellow('No container is using ') +
                    chalk.green(selectedPort) +
                    chalk.yellow(', you are free to use it!')
            )
        }
    }
})
