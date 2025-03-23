declare module "platformsh-config" {
    class Config {
        config(): {
            port: number;
        };
    }
    
    const pConfig: Config;
    export default pConfig;
}
