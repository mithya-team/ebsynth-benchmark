require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://cloud.lambdalabs.com/api/v1';

axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.LAMBDALABS_TOKEN}`;


const listAvailableInstanceTypes = async () => {
    const { data: { data } } = await axios.get(BASE_URL + '/instance-types');

    return data;
}

const listRunningInstances = async () => {
    const { data: { data } } = await axios.get(BASE_URL + '/instances');

    return data;
}

const getInstanceDetail = async (instance_id) => {
    const { data: { data } } = await axios.get(BASE_URL + '/instances/' + instance_id);

    return data;
}

const launchInstance = async (instance_type_name, region_name = "us-west-1", ssh_key_names) => {
    const { data: { data } } = await axios.post(BASE_URL + '/instance-operations/launch', {
        instance_type_name: instance_type_name || "gpu_1x_a10",
        region_name: region_name || "us-west-1",
        ssh_key_names: ssh_key_names || ["saurabhguptawindows"],
        file_system_names: [],
        quantity: 1
    });

    return data;
}

const terminateInstance = async (instance_ids) => {
    const { data: { data } } = await axios.post(BASE_URL + '/instance-operations/terminate', {
        instance_ids
    });

    return data;
}

module.exports = {
    listAvailableInstanceTypes,
    listRunningInstances,
    getInstanceDetail,
    launchInstance,
    terminateInstance
}
