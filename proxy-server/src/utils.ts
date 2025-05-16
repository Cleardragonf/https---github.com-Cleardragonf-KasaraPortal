import { exec } from 'child_process';


// Define services list
export const services: { [key in 'tzautoupdate' | 'AJRouter' | 'AdaptivaClient' | 'EdifecsTMConfigServer' | 'EdifecsTMAgent' | 'EdifecsTMBatchETL' | 'EdifecsTMBIService' | 'EdifecsTMRealTimeETL' | 'EdifecsTMServiceManager' | 'EdifecsTMETLResubmission' | 'Edifecs_XEServer_CareTeam_Identifier_Processor' | 'Edifecs_XEServer_FHIR_Aux' | 'Edifecs_XEServer_FHIR_Common_ETL' | 'Edifecs_XEServer_FHIR_Data_Fixer_Framework' | 'Edifecs_XEServer_FHIR_DataIntake' | 'Edifecs_XEServer_FHIR_Provider_Data_ETL' | 'Edifecs_XEServer_FHIR_Secure_Proxy_PD' | 'Edifecs_XEServer_FHIR_Secure_Proxy' | 'Edifecs_XEServer_FHIR_Server_PD' | 'Edifecs_XEServer_FHIR_Server' | 'Edifecs_XEServer_Nebraska_BackEnd_CustomRoutes' | 'Edifecs_XEServer_Operating_Rules_Batch' | 'Edifecs_XEServer_Operating_Rules_Batch_Data_Extraction' | 'Edifecs_XEServer_Operating_Rules_EFT_ERA' | 'Edifecs_XEServer_Operating_Rules_EFT_ERA_Data_Extraction' | 'Edifecs_XEServer_Operating_Rules_Realtime_TM' | 'Edifecs_XEServer_Operating_Rules_Realtime' | 'Edifecs_XEServer_Operating_Rules_Service' | 'Edifecs_XEServer_Operating_Rules_ETL_Task_Scheduler' | 'Edifecs_XEServer_Operating_Rules_Realtime_Data_Extraction' | 'Edifecs_XEServer_StateNE_TM_PartnerWebService' | 'Edifecs_XEServer_TM_Archive' | 'Edifecs_XEServer_TM_Archiver_GBD' | 'Edifecs_XEServer_TM_BusinessView' | 'Edifecs_XEServer_TM_RIM_GBD' | 'Edifecs_XEServer_TM_Search_IndexerGBD' | 'Edifecs_XEServer_TM_Search_Service' | 'Edifecs_XEServer_TMResubmission' | 'Edifecs_XEServer_TrackingInfoProcessor' | 'Edifecs_XEServer_StateNE_Inbound_278' | 'Edifecs_XEServer_StateNE_Inbound_SFTP_27X' | 'Edifecs_XEServer_StateNE_Inbound837' | 'Edifecs_XEServer_StateNE_RunVBScripts' | 'Edifecs_XEServer_StateNE_Edifecs_Routing_V2' | 'Edifecs_XEServer_StateNE_Outbound' | 'elasticsearch-service-x64' | 'MQ_Installation1' | 'Tomcat9' | 'tabsvc_0' | 'vs-representation' | 'vs-storage' | 'vs-web-service' | 'EdifecsXESManager' ]: string } = {
    AJRouter: 'AJRouter',
    tzautoupdate: 'tzautoupdate',
    AdaptivaClient: 'AdaptivaClient',
    EdifecsTMConfigServer: 'EdifecsTMConfigServer',
  EdifecsTMAgent: 'EdifecsTMAgent',
  EdifecsTMBatchETL: 'EdifecsTMBatchETL',
  EdifecsTMBIService: 'EdifecsTMBIService',
  EdifecsTMRealTimeETL: 'EdifecsTMRealTimeETL',
  EdifecsTMServiceManager: 'EdifecsTMServiceManager',
  EdifecsTMETLResubmission: 'EdifecsTMETLResubmission',
  Edifecs_XEServer_CareTeam_Identifier_Processor: 'Edifecs_XEServer_CareTeam_Identifier_Processor',
  Edifecs_XEServer_FHIR_Aux: 'Edifecs_XEServer_FHIR_Aux',
  Edifecs_XEServer_FHIR_Common_ETL: 'Edifecs_XEServer_FHIR_Common_ETL',
  Edifecs_XEServer_FHIR_Data_Fixer_Framework: 'Edifecs_XEServer_FHIR_Data_Fixer_Framework',
  Edifecs_XEServer_FHIR_DataIntake: 'Edifecs_XEServer_FHIR_DataIntake',
  Edifecs_XEServer_FHIR_Provider_Data_ETL: 'Edifecs_XEServer_FHIR_Provider_Data_ETL',
  Edifecs_XEServer_FHIR_Secure_Proxy_PD: 'Edifecs_XEServer_FHIR_Secure_Proxy_PD',
  Edifecs_XEServer_FHIR_Secure_Proxy: 'Edifecs_XEServer_FHIR_Secure_Proxy',
  Edifecs_XEServer_FHIR_Server_PD: 'Edifecs_XEServer_FHIR_Server_PD',
  Edifecs_XEServer_FHIR_Server: 'Edifecs_XEServer_FHIR_Server',
  Edifecs_XEServer_Nebraska_BackEnd_CustomRoutes: 'Edifecs_XEServer_Nebraska_BackEnd_CustomRoutes',
  Edifecs_XEServer_Operating_Rules_Batch: 'Edifecs_XEServer_Operating_Rules_Batch',
  Edifecs_XEServer_Operating_Rules_Batch_Data_Extraction: 'Edifecs_XEServer_Operating_Rules_Batch_Data_Extraction',
  Edifecs_XEServer_Operating_Rules_EFT_ERA: 'Edifecs_XEServer_Operating_Rules_EFT_ERA',
  Edifecs_XEServer_Operating_Rules_EFT_ERA_Data_Extraction: 'Edifecs_XEServer_Operating_Rules_EFT_ERA_Data_Extraction',
  Edifecs_XEServer_Operating_Rules_Realtime_TM: 'Edifecs_XEServer_Operating_Rules_Realtime_TM',
  Edifecs_XEServer_Operating_Rules_Realtime: 'Edifecs_XEServer_Operating_Rules_Realtime',
  Edifecs_XEServer_Operating_Rules_Service: 'Edifecs_XEServer_Operating_Rules_Service',
  Edifecs_XEServer_Operating_Rules_ETL_Task_Scheduler: 'Edifecs_XEServer_Operating_Rules_ETL_Task_Scheduler',
  Edifecs_XEServer_Operating_Rules_Realtime_Data_Extraction: 'Edifecs_XEServer_Operating_Rules_Realtime_Data_Extraction',
  Edifecs_XEServer_StateNE_TM_PartnerWebService: 'Edifecs_XEServer_StateNE_TM_PartnerWebService',
  Edifecs_XEServer_TM_Archive: 'Edifecs_XEServer_TM_Archive',
  Edifecs_XEServer_TM_Archiver_GBD: 'Edifecs_XEServer_TM_Archiver_GBD',
  Edifecs_XEServer_TM_BusinessView: 'Edifecs_XEServer_TM_BusinessView',
  Edifecs_XEServer_TM_RIM_GBD: 'Edifecs_XEServer_TM_RIM_GBD',
  Edifecs_XEServer_TM_Search_IndexerGBD: 'Edifecs_XEServer_TM_Search_IndexerGBD',
  Edifecs_XEServer_TM_Search_Service: 'Edifecs_XEServer_TM_Search_Service',
  Edifecs_XEServer_TMResubmission: 'Edifecs_XEServer_TMResubmission',
  Edifecs_XEServer_TrackingInfoProcessor: 'Edifecs_XEServer_TrackingInfoProcessor',
  Edifecs_XEServer_StateNE_Inbound_278: 'Edifecs_XEServer_StateNE_Inbound_278',
  Edifecs_XEServer_StateNE_Inbound_SFTP_27X: 'Edifecs_XEServer_StateNE_Inbound_SFTP_27X',
  Edifecs_XEServer_StateNE_Inbound837: 'Edifecs_XEServer_StateNE_Inbound837',
  Edifecs_XEServer_StateNE_RunVBScripts: 'Edifecs_XEServer_StateNE_RunVBScripts',
  Edifecs_XEServer_StateNE_Edifecs_Routing_V2: 'Edifecs_XEServer_StateNE_Edifecs_Routing_V2',
  Edifecs_XEServer_StateNE_Outbound: 'Edifecs_XEServer_StateNE_Outbound',
  "elasticsearch-service-x64": 'elasticsearch-service-x64',
  MQ_Installation1: 'MQ_Installation1',
  Tomcat9: 'Tomcat9',
  tabsvc_0: 'tabsvc_0',
  "vs-representation": 'vs-representation',
  "vs-storage": 'vs-storage',
  "vs-web-service": 'vs-web-service',
  EdifecsXESManager: 'EdifecsXESManager'
};

// SQL Server configuration (for MSSQL, not Postgres)
export const sqlConfig = {
  user: 'postgres',  // Replace with your database username
  password: 'Dv9608nr',  // Replace with your database password
  host: 'play.ryugame.net',  // Replace with your Postgres server address
  database: 'EDI_ST_NECustom',  // Replace with your database name
  port: 5432, // Default Postgres port
  ssl: {
    rejectUnauthorized: false
  }
};

export const KasaraPortal = {
  user: 'postgres',  // Replace with your database username
  password: 'Dv9608nr',  // Replace with your database password
  host: 'play.ryugame.net',  // Replace with your Postgres server address
  database: 'KasaraPortal',  // Replace with your database name
  port: 5432, // Default Postgres port
  ssl: {
    rejectUnauthorized: false
  }
};

export const TranslatorPortal = {
  user: 'postgres', // Replace with your database username
  password: 'Dv9608nr', // Replace with your database password
  host: 'play.ryugame.net', // Replace with your Postgres server address
  database: 'KasaraPortal', // Replace with your database name
  port: 5432, // Default Postgres port
  ssl: {
    rejectUnauthorized: false
  }
};


  export function getSystemStats(): Promise<any> {
    return new Promise((resolve, reject) => {
      const systemStats: any = {};
  
      // CPU Usage (Linux, MacOS, Windows)
      exec('wmic cpu get loadpercentage', (error, stdout, stderr) => {
        if (error || stderr) {
          systemStats.cpu = NaN;  // Return NaN if an error occurs
        } else {
          const cpuUsage = stdout.split('\n')[1]?.trim();
          systemStats.cpu = cpuUsage ? parseInt(cpuUsage, 10) : NaN;  // Return numeric value or NaN
        }
  
        // Memory Usage (Windows example)
        exec('wmic OS get FreePhysicalMemory,TotalVisibleMemorySize', (error, stdout, stderr) => {
          if (error || stderr) {
            systemStats.memory = NaN;  // Return NaN if an error occurs
          } else {
            const lines = stdout.split('\n').map(line => line.trim());
            const freeMemory = parseInt(lines[1]?.split(' ')[0], 10) || 0;
            const totalMemory = parseInt(lines[1]?.split(' ')[1], 10) || 0;
            const usedMemory = totalMemory - freeMemory;
            const usedMemoryPercentage = (usedMemory / totalMemory) * 100;
            systemStats.memory = !isNaN(usedMemoryPercentage) ? usedMemoryPercentage : NaN;  // Return percentage as number or NaN
          }
  
          // Disk Usage (Windows example)
          exec('wmic logicaldisk get size,freespace,caption', (error, stdout, stderr) => {
            if (error || stderr) {
              systemStats.disk = NaN;  // Return NaN if an error occurs
            } else {
              const lines = stdout.split('\n').map(line => line.trim());
              const disk = lines[1]?.split(' ') || [];
              const freeSpace = parseInt(disk[1], 10) || 0;
              const totalSpace = parseInt(disk[0], 10) || 0;
              const usedSpace = totalSpace - freeSpace;
              const usedSpacePercentage = (usedSpace / totalSpace) * 100;
              systemStats.disk = !isNaN(usedSpacePercentage) ? usedSpacePercentage : NaN;  // Return percentage as number or NaN
            }
  
            resolve(systemStats);  // Resolve with the system stats
          });
        });
      });
    });
  }

export function formatUptime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
}
