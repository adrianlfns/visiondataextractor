using System;
using System.Collections.Generic;
using System.Text.Json;

namespace VisionDataExtractor.Models
{
    public class ExtractionResult
    {
        public string ImageName { get; set; }
        public Dictionary<string, string> ExtractedData { get; set; } = new Dictionary<string, string>();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public List<DataField> DataFields { get; set; } = new List<DataField>();

        public string ToJson()
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            return JsonSerializer.Serialize(this, options);
        }
    }
}
