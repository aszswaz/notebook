import { createWebHistory, createRouter } from "vue-router";
import DemoRouter from "./DemoRouter"

const routes = [
    {path: '/router-demo', name: 'DemoRouter', component: DemoRouter}
]
export default createRouter({
    history: createWebHistory(),
    routes
})
